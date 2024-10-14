import { HttpException, HttpStatus, Inject, Injectable, Logger, MessageEvent } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseString } from 'xml2js';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import { Subject, Observable, map } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import CustomHttpException from '@libs/error/CustomHttpException';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import BbbResponseDto from '@libs/conferences/types/bbb-api/bbb-response.dto';
import ConferenceRole from '@libs/conferences/types/conference-role.enum';
import { GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import JWTUser from '../types/JWTUser';
import { Conference, ConferenceDocument } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import Attendee from './attendee.schema';

interface SseEvent {
  username: string;
  data: {
    message: string;
  };
}

type GroupWithMembers = {
  id: string;
  name: string;
  path: string;
  members: GroupMemberDto[];
};

@Injectable()
class ConferencesService {
  private BBB_API_URL: string;

  private BBB_SECRET: string;

  private userConnections: Map<string, Subject<SseEvent>> = new Map();

  constructor(
    @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly appConfigService: AppConfigService,
  ) {}

  static handleBBBApiError(result: { response: { returncode: string } }) {
    if (result.response.returncode !== 'SUCCESS') {
      throw new HttpException(ConferencesErrorMessage.BbbUnauthorized, HttpStatus.UNAUTHORIZED);
    }
  }

  static parseXml<T>(xml: string): Promise<T> {
    return new Promise((resolve, reject) => {
      parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        } else {
          resolve(result as T);
        }
      });
    });
  }

  static getJoinedAttendees(bbbMeetingDto: BbbResponseDto): Attendee[] {
    const { attendees } = bbbMeetingDto.response;
    if (!attendees?.attendee) {
      return [];
    }
    if (!Array.isArray(attendees.attendee)) {
      return [
        {
          lastName: attendees.attendee.role,
          firstName: attendees.attendee.fullName,
          username: attendees.attendee.userID,
        },
      ];
    }
    return attendees.attendee.map((a) => ({
      lastName: a.role,
      firstName: a.fullName,
      username: a.userID,
    }));
  }

  async loadConfig() {
    if (this.BBB_API_URL && this.BBB_SECRET) {
      return;
    }

    const appConfig = await this.appConfigService.getAppConfigByName('conferences');
    if (!appConfig?.options.url || !appConfig.options.apiKey) {
      throw new CustomHttpException(ConferencesErrorMessage.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.BBB_API_URL = appConfig.options.url;
    this.BBB_SECRET = appConfig.options.apiKey;
  }

  async getInvitedMembers(createConferenceDto: CreateConferenceDto): Promise<string[]> {
    const usersInGroups = await Promise.all(
      createConferenceDto.invitedGroups.map(async (group) => {
        const groupWithMembers = (await this.cacheManager.get(
          `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
        )) as GroupWithMembers;
        Logger.log(groupWithMembers, Conference.name);
        const members = groupWithMembers?.members;
        Logger.log(groupWithMembers, Conference.name);
        const users = members?.map((member) => member.username);
        return users;
      }),
    );

    return usersInGroups.flat();
  }

  async create(createConferenceDto: CreateConferenceDto, currentUser: JWTUser): Promise<Conference | undefined> {
    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    const newConference = {
      name: createConferenceDto.name,
      creator,
      meetingID: uuidv4(),
      password: createConferenceDto.password,
      invitedAttendees: [...createConferenceDto.invitedAttendees, creator],
      invitedGroups: createConferenceDto.invitedGroups,
      isMeetingStarted: false,
    };

    try {
      return await this.conferenceModel.create(newConference);
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY, e);
    } finally {
      const invitedGroups = await this.getInvitedMembers(createConferenceDto);
      const allUsers = [...createConferenceDto.invitedAttendees.map((attendee) => attendee.username), ...invitedGroups];

      const sanitizedUsers = Array.from(new Set(allUsers));
      this.sendEventToUsers(sanitizedUsers);
    }
  }

  async toggleConferenceIsRunning(meetingID: string, username: string) {
    const { conference, isCreator } = await this.isCurrentUserTheCreator(meetingID, username);
    if (!isCreator) {
      throw new CustomHttpException(ConferencesErrorMessage.YouAreNotTheCreator, HttpStatus.UNAUTHORIZED);
    }

    if (conference.isRunning) {
      await this.stopConference(conference);
    } else {
      await this.startConference(conference);
    }
  }

  async startConference(conference: Conference) {
    try {
      const query = `name=${encodeURIComponent(conference.name)}&meetingID=${conference.meetingID}`;
      const checksum = await this.createChecksum('create', query);
      const url = `${this.BBB_API_URL}create?${query}&checksum=${checksum}`;

      const response = await axios.get<string>(url);
      const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
      ConferencesService.handleBBBApiError(result);

      await this.update({ ...conference, isRunning: true });
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY, e);
    } finally {
      this.sendEventToUsers(conference.invitedAttendees.map((attendee) => attendee.username));
    }
  }

  async stopConference(conference: Conference) {
    try {
      const query = `meetingID=${conference.meetingID}`;
      const checksum = await this.createChecksum('end', query);
      const url = `${this.BBB_API_URL}end?${query}&checksum=${checksum}`;

      const response = await axios.get<string>(url);
      const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
      ConferencesService.handleBBBApiError(result);

      await this.update({ ...conference, isRunning: false });
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY, e);
    } finally {
      this.sendEventToUsers(conference.invitedAttendees.map((attendee) => attendee.username));
    }
  }

  public async isCurrentUserTheCreator(
    meetingID: string,
    username: string,
  ): Promise<{ conference: Conference; isCreator: boolean }> {
    const conference = await this.findOne(meetingID);
    if (!conference) {
      throw new CustomHttpException(ConferencesErrorMessage.MeetingNotFound, HttpStatus.NOT_FOUND, { meetingID });
    }
    return { conference, isCreator: conference.creator.username === username };
  }

  async join(meetingID: string, user: JWTUser): Promise<string> {
    try {
      const { preferred_username: username, given_name: givenName, family_name: familyName } = user;

      let role = ConferenceRole.Viewer;
      const { isCreator } = await this.isCurrentUserTheCreator(meetingID, username);
      if (isCreator) {
        role = ConferenceRole.Moderator;
      }

      const fullName = `${givenName} ${familyName}`;
      const query = `meetingID=${meetingID}&fullName=${encodeURIComponent(fullName)}&role=${role}&userID=${encodeURIComponent(username)}&redirect=true`;
      const checksum = await this.createChecksum('join', query);

      return `${this.BBB_API_URL}join?${query}&checksum=${checksum}`;
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY, e);
    }
  }

  async findAllConferencesTheUserHasAccessTo(user: JWTUser): Promise<Conference[]> {
    const groupPathConditions = user.ldapGroups.map((groupPath) => ({ 'invitedGroups.path': groupPath }));

    const conferencesToBeSynced = await this.conferenceModel
      .find({
        $or: [{ 'invitedAttendees.username': user.preferred_username }, ...groupPathConditions],
      })
      .exec();
    return this.syncConferencesWithBBB(conferencesToBeSynced);
  }

  async findOne(meetingID: string): Promise<Conference | null> {
    return this.conferenceModel.findOne<Conference>({ meetingID }).exec();
  }

  async update(conference: Conference): Promise<Conference | null> {
    return this.conferenceModel
      .findOneAndUpdate<Conference>(
        {
          meetingID: conference.meetingID,
        },
        conference,
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(meetingIDs: string[], username: string): Promise<boolean> {
    try {
      const result = await this.conferenceModel
        .deleteMany({
          meetingID: { $in: meetingIDs },
          'creator.username': username,
        })
        .exec();
      return result.deletedCount > 0;
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.MeetingNotFound, HttpStatus.NOT_FOUND, { meetingIDs });
    } finally {
      this.informAllUsers('Conference deleted');
    }
  }

  async createChecksum(method = '', query = '') {
    await this.loadConfig();
    const string = method + query + this.BBB_SECRET;

    return createHash('sha1').update(string).digest('hex');
  }

  private async syncConferencesWithBBB(conferencesToBeSynced: ConferenceDocument[]): Promise<Conference[]> {
    const promises = conferencesToBeSynced.map(async (conference) => {
      const conferenceObject = conference.toObject() as ConferenceDocument;
      const query = `meetingID=${conference.meetingID}`;
      const checksum = await this.createChecksum('getMeetingInfo', query);
      const url = `${this.BBB_API_URL}getMeetingInfo?${query}&checksum=${checksum}`;

      try {
        const response = await axios.get<string>(url);
        const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
        ConferencesService.handleBBBApiError(result);

        await this.update({ ...conferenceObject, isRunning: true });
        return { ...conferenceObject, isRunning: true, joinedAttendees: ConferencesService.getJoinedAttendees(result) };
      } catch (_) {
        const updatedConference = { ...conferenceObject, isRunning: false };
        await this.update(updatedConference);
        return updatedConference;
      }
    });

    return Promise.all(promises);
  }

  subscribe(username: string): Observable<MessageEvent> {
    if (!this.userConnections.has(username)) {
      this.userConnections.set(username, new Subject<SseEvent>());
    }

    const userConnection = this.userConnections.get(username);

    if (userConnection) {
      return userConnection.pipe(map((event: SseEvent) => ({ data: event.data }) as MessageEvent));
    }
    throw new Error(`User connection for ${username} is undefined.`);
  }

  sendEventToUser(username: string) {
    const userStream = this.userConnections.get(username);
    if (userStream) {
      userStream.next({ username, data: { message: 'Conference updated' } });
    }
  }

  sendEventToUsers(attendees: string[]) {
    attendees.forEach((usr) => this.sendEventToUser(usr));
  }

  informAllUsers(message: string): void {
    this.userConnections.forEach((subject, username) => {
      subject.next({
        username,
        data: {
          message,
        },
      });
    });
  }
}

export default ConferencesService;
