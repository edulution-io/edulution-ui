import { HttpException, HttpStatus, Inject, Injectable, MessageEvent } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseString } from 'xml2js';
import { Model } from 'mongoose';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { createHash } from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Cache } from 'cache-manager';
import CustomHttpException from '@libs/error/CustomHttpException';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import BbbResponseDto from '@libs/conferences/types/bbb-api/bbb-response.dto';
import ConferenceRole from '@libs/conferences/types/conference-role.enum';
import { GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import APPS from '@libs/appconfig/constants/apps';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import CONFERENCES_SYNC_INTERVAL from '@libs/conferences/constants/schedulerRegistry';
import { Conference, ConferenceDocument } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import Attendee from './attendee.schema';
import SseService from '../sse/sse.service';
import type UserConnections from '../types/userConnections';

const { BBB_POLL_INTERVAL } = process.env as {
  [key: string]: string;
};

@Injectable()
class ConferencesService {
  private BBB_API_URL: string;

  private BBB_SECRET: string;

  private conferencesSseConnections: UserConnections = new Map();

  constructor(
    @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly appConfigService: AppConfigService,
    private schedulerRegistry: SchedulerRegistry,
  ) {
    this.scheduleConferenceSync();
  }

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.conferencesSseConnections, res);
  }

  private pollInterval = Number.parseInt(BBB_POLL_INTERVAL, 10) || 60000;

  scheduleConferenceSync() {
    const interval = setInterval(() => {
      void this.syncRunningConferencesStatus();
    }, this.pollInterval);

    this.schedulerRegistry.addInterval(CONFERENCES_SYNC_INTERVAL, interval);
  }

  async syncRunningConferencesStatus() {
    const runningConferences = await this.conferenceModel.find({ isRunning: true }).exec();
    await Promise.all(
      runningConferences.map(async (conference) => {
        const isRunning = await this.checkConferenceIsRunningWithBBB(conference.meetingID);
        if (!isRunning) {
          await this.update({ ...conference.toObject(), isRunning: false });
          const attendees = await this.getInvitedMembers(conference);
          SseService.sendEventToUsers(
            attendees,
            this.conferencesSseConnections,
            conference.meetingID,
            SSE_MESSAGE_TYPE.STOPPED,
          );
        }
      }),
    );
  }

  async checkConferenceIsRunningWithBBB(meetingID: string): Promise<boolean> {
    const query = `meetingID=${meetingID}`;
    const checksum = await this.createChecksum('isMeetingRunning', query);
    const url = `${this.BBB_API_URL}isMeetingRunning?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get<string>(url);
      const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
      ConferencesService.handleBBBApiError(result);
      return result.response.running === 'true';
    } catch (e) {
      return false;
    }
  }

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

    const appConfig = await this.appConfigService.getAppConfigByName(APPS.CONFERENCES);
    if (!appConfig?.options.url || !appConfig.options.apiKey) {
      throw new CustomHttpException(ConferencesErrorMessage.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    this.BBB_API_URL = appConfig.options.url;
    this.BBB_SECRET = appConfig.options.apiKey;
  }

  async getInvitedMembers(createConferenceDto: CreateConferenceDto | Conference): Promise<string[]> {
    const usersInGroups = await Promise.all(
      createConferenceDto.invitedGroups.map(async (group) => {
        const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
          `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
        );

        return groupWithMembers?.members?.map((member) => member.username) || [];
      }),
    );

    const invitedMembersList = Array.from(
      new Set([...createConferenceDto.invitedAttendees.map((attendee) => attendee.username), ...usersInGroups.flat()]),
    );

    return invitedMembersList;
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
      throw new CustomHttpException(ConferencesErrorMessage.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      const invitedMembersList = await this.getInvitedMembers(createConferenceDto);
      const conference = await this.conferenceModel
        .findOne({ meetingID: newConference.meetingID }, { _id: 0, __v: 0 })
        .lean();
      if (conference) {
        SseService.sendEventToUsers(
          invitedMembersList,
          this.conferencesSseConnections,
          conference,
          SSE_MESSAGE_TYPE.CREATED,
        );
      }
    }
  }

  async toggleConferenceIsRunning(meetingID: string, username: string) {
    const { conference, isCreator } = await this.isCurrentUserTheCreator(meetingID, username);
    if (!isCreator) {
      throw new CustomHttpException(ConferencesErrorMessage.YouAreNotTheCreator, HttpStatus.UNAUTHORIZED);
    }

    if (conference.isRunning) {
      await this.stopConference(conference, this.conferencesSseConnections);
    } else {
      await this.startConference(conference, this.conferencesSseConnections);
    }
  }

  async startConference(conference: Conference, conferencesSseConnections: UserConnections) {
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
      const invitedMembersList = await this.getInvitedMembers(conference);
      SseService.sendEventToUsers(
        invitedMembersList,
        conferencesSseConnections,
        conference.meetingID,
        SSE_MESSAGE_TYPE.STARTED,
      );
    }
  }

  async stopConference(conference: Conference, conferencesSseConnections: UserConnections) {
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
      const invitedMembersList = await this.getInvitedMembers(conference);
      SseService.sendEventToUsers(
        invitedMembersList,
        conferencesSseConnections,
        conference.meetingID,
        SSE_MESSAGE_TYPE.STOPPED,
      );
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
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY);
    }
  }

  async findAllConferencesTheUserHasAccessTo(user: JWTUser): Promise<Conference[]> {
    const groupPathConditions = user.ldapGroups.map((groupPath) => ({ 'invitedGroups.path': groupPath }));

    const conferencesToBeSynced = await this.conferenceModel
      .find({
        $or: [{ 'invitedAttendees.username': user.preferred_username }, ...groupPathConditions],
      })
      .exec();

    return this.syncConferencesInfoWithBBB(conferencesToBeSynced);
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
    const conferences = await this.conferenceModel.find({ meetingID: { $in: meetingIDs } }, { _id: 0, __v: 0 }).lean();

    if (conferences.length === 0) {
      throw new CustomHttpException(ConferencesErrorMessage.MeetingNotFound, HttpStatus.NOT_FOUND, { meetingIDs });
    }

    const result = await this.conferenceModel
      .deleteMany({
        meetingID: { $in: meetingIDs },
        'creator.username': username,
      })
      .exec();

    if (result.deletedCount === 0) {
      throw new CustomHttpException(ConferencesErrorMessage.MeetingNotFound, HttpStatus.NOT_FOUND, { meetingIDs });
    }

    const invitedMembersList = (
      await Promise.all(conferences.map((conference) => this.getInvitedMembers(conference)))
    ).flat();

    SseService.sendEventToUsers(
      invitedMembersList,
      this.conferencesSseConnections,
      meetingIDs,
      SSE_MESSAGE_TYPE.DELETED,
    );

    return true;
  }

  async createChecksum(method = '', query = '') {
    await this.loadConfig();
    const string = method + query + this.BBB_SECRET;

    return createHash('sha1').update(string).digest('hex');
  }

  private async syncConferencesInfoWithBBB(conferencesToBeSynced: ConferenceDocument[]): Promise<Conference[]> {
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
}

export default ConferencesService;
