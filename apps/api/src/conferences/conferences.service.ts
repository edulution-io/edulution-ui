import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import CustomHttpException from '@libs/error/CustomHttpException';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import BbbResponseDto from '@libs/conferences/types/bbb-api/bbb-response.dto';
import ConferenceRole from '@libs/conferences/types/conference-role.enum';
import JWTUser from '../types/JWTUser';
import { Conference, ConferenceDocument } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import Attendee from './attendee.schema';

@Injectable()
class ConferencesService {
  private BBB_API_URL: string;

  private BBB_SECRET: string;

  constructor(
    @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
    private readonly appConfigService: AppConfigService,
  ) {}

  static handleBBBApiError(result: { response: { returncode: string } }) {
    if (result.response.returncode !== 'SUCCESS') {
      throw new HttpException(ConferencesErrorMessage.BbbUnauthorized, HttpStatus.UNAUTHORIZED);
    }
  }

  static parseXml<T>(xml: string): Promise<T> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
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

  async create(createConferenceDto: CreateConferenceDto, currentUser: JWTUser): Promise<Conference> {
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

    return this.conferenceModel.create(newConference);
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
    const groupPathConditions = user.ldapGroups.map((groupPath) => {
      return { 'invitedGroups.path': groupPath };
    });

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
    const result = await this.conferenceModel
      .deleteMany({
        meetingID: { $in: meetingIDs },
        'creator.username': username,
      })
      .exec();

    return result.deletedCount > 0;
  }

  async createChecksum(method = '', query = '') {
    await this.loadConfig();
    const string = method + query + this.BBB_SECRET;

    return crypto.createHash('sha1').update(string).digest('hex');
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
}

export default ConferencesService;
