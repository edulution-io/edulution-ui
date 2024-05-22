import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Conference, ConferenceDocument } from './conference.schema';
import CreateConferenceDto from './dto/create-conference.dto';
import BbbResponseDto from './bbb-api/bbb-response.dto';
import JWTUser from '../types/JWTUser';
import { Attendee } from './dto/attendee';
import ConferenceRole from './dto/conference-role.enum';
import AppConfigService from '../appconfig/appconfig.service';

@Injectable()
class ConferencesService {
  private BBB_API_URL: string;

  private BBB_SECRET: string;

  constructor(
    @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
    private readonly appConfigService: AppConfigService,
  ) {}

  async loadConfig() {
    const appConfig = await this.appConfigService.getAppConfigByName('conferences');
    if (!appConfig?.options.url || !appConfig.options.apiKey) {
      throw new HttpException('App is not properly configured', HttpStatus.SERVICE_UNAVAILABLE);
    }
    this.BBB_API_URL = appConfig.options.url;
    this.BBB_SECRET = appConfig.options.apiKey;
  }

  async create(createConferenceDto: CreateConferenceDto, currentUser: JWTUser): Promise<Conference> {
    await this.loadConfig();

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
      isMeetingStarted: false,
    };

    const createdConference = await this.conferenceModel.create(newConference);
    return createdConference;
  }

  async toggleConferenceIsRunning(meetingID: string, username: string) {
    await this.loadConfig();

    const { conference, isCreator } = await this.isCurrentUserTheCreator(meetingID, username);
    if (!isCreator) {
      throw new HttpException('You are not the creator!', HttpStatus.UNAUTHORIZED);
    }

    if (conference.isRunning) {
      await this.stopConference(conference, username);
    } else {
      await this.startConference(conference, username);
    }
  }

  private async startConference(conference: Conference, username: string) {
    await this.loadConfig();

    try {
      const query = `name=${encodeURIComponent(conference.name)}&meetingID=${conference.meetingID}`;
      const checksum = this.createChecksum('create', query);
      const url = `${this.BBB_API_URL}create?${query}&checksum=${checksum}`;

      const response = await axios.get<string>(url);
      const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
      ConferencesService.handleBBBApiError(result);

      await this.update({ ...conference, isRunning: true }, username);
    } catch (e) {
      Logger.error(e, ConferencesService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  private async stopConference(conference: Conference, username: string) {
    await this.loadConfig();

    try {
      const query = `meetingID=${conference.meetingID}`;
      const checksum = this.createChecksum('end', query);
      const url = `${this.BBB_API_URL}end?${query}&checksum=${checksum}`;

      const response = await axios.get<string>(url);
      const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
      ConferencesService.handleBBBApiError(result);

      await this.update({ ...conference, isRunning: false }, username);
    } catch (e) {
      Logger.error(e, ConferencesService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  private async isCurrentUserTheCreator(
    meetingID: string,
    username: string,
  ): Promise<{ conference: Conference; isCreator: boolean }> {
    const conference = await this.findOne(meetingID);
    if (!conference) {
      throw new HttpException(`No meeting with ID ${meetingID} found`, HttpStatus.SERVICE_UNAVAILABLE);
    }
    return { conference, isCreator: conference.creator.username === username };
  }

  async join(meetingID: string, user: JWTUser): Promise<string> {
    await this.loadConfig();

    try {
      const { preferred_username: username, given_name: givenName, family_name: familyName } = user;

      let role = ConferenceRole.Viewer;
      const { isCreator } = await this.isCurrentUserTheCreator(meetingID, username);
      if (isCreator) {
        role = ConferenceRole.Moderator;
      }

      const fullName = `${givenName} ${familyName}`;
      const query = `meetingID=${meetingID}&fullName=${encodeURIComponent(fullName)}&role=${role}&userID=${encodeURIComponent(username)}&redirect=true`;
      const checksum = this.createChecksum('join', query);
      const url = `${this.BBB_API_URL}join?${query}&checksum=${checksum}`;

      return url;
    } catch (e) {
      Logger.error(e, ConferencesService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async findAll(username: string): Promise<Conference[]> {
    await this.loadConfig();

    const usersConferences = await this.conferenceModel.find({ 'invitedAttendees.username': username }).exec();

    const promises = usersConferences.map(async (conference) => {
      const conferenceObject = conference.toObject();
      const query = `meetingID=${conference.meetingID}`;
      const checksum = this.createChecksum('getMeetingInfo', query);
      const url = `${this.BBB_API_URL}getMeetingInfo?${query}&checksum=${checksum}`;

      try {
        const response = await axios.get<string>(url);
        const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
        ConferencesService.handleBBBApiError(result);

        await this.update({ ...conferenceObject, isRunning: true }, username);
        return { ...conferenceObject, isRunning: true, joinedAttendees: ConferencesService.getJoinedAttendees(result) };
      } catch (_) {
        const updatedConference = { ...conferenceObject, isRunning: false };
        await this.update(updatedConference, username);
        return updatedConference;
      }
    });

    const updatedConferences = await Promise.all(promises);
    return updatedConferences;
  }

  async findOne(meetingID: string): Promise<Conference | null> {
    await this.loadConfig();
    return this.conferenceModel.findOne<Conference>({ meetingID }).exec();
  }

  async update(conference: Conference, username: string): Promise<Conference | null> {
    await this.loadConfig();
    return this.conferenceModel
      .findOneAndUpdate<Conference>(
        {
          meetingID: conference.meetingID,
          'creator.username': username,
        },
        conference,
        {
          new: true,
        },
      )
      .exec();
  }

  async remove(meetingIDs: string[], username: string): Promise<boolean> {
    await this.loadConfig();
    const result = await this.conferenceModel
      .deleteMany({
        meetingID: { $in: meetingIDs },
        'creator.username': username,
      })
      .exec();

    return result.deletedCount > 0;
  }

  static handleBBBApiError(result: { response: { returncode: string } }) {
    if (result.response.returncode !== 'SUCCESS') {
      throw new Error('BBB API did not return SUCCESS returncode');
    }
  }

  createChecksum(method = '', query = '') {
    const string = method + query + this.BBB_SECRET;

    return crypto.createHash('sha1').update(string).digest('hex');
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
    let joinedAttendees: Attendee[] = [];
    if (attendees?.attendee) {
      if (!Array.isArray(attendees.attendee)) {
        joinedAttendees = [
          {
            lastName: attendees.attendee.role,
            firstName: attendees.attendee.fullName,
            username: attendees.attendee.userID,
          },
        ];
      } else {
        joinedAttendees = attendees.attendee.map((a) => ({
          lastName: a.role,
          firstName: a.fullName,
          username: a.userID,
        }));
      }
    }

    return joinedAttendees;
  }
}

export default ConferencesService;
