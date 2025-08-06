/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { parseString } from 'xml2js';
import { Model } from 'mongoose';
import { createHash } from 'crypto';
import { Interval } from '@nestjs/schedule';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import BbbResponseDto from '@libs/conferences/types/bbb-api/bbb-response.dto';
import ConferenceRole from '@libs/conferences/types/conference-role.enum';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import APPS from '@libs/appconfig/constants/apps';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import CONFERENCES_SYNC_INTERVAL_MS from '@libs/conferences/constants/conferencesSyncInterval';
import stringToBoolean from '@libs/common/utils/stringToBoolean';
import splitAtLastWhitespace from '@libs/common/utils/splitStringAtLastWhitespace';
import JoinPublicConferenceDetails from '@libs/conferences/types/joinPublicConferenceDetails';
import { OnEvent } from '@nestjs/event-emitter';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import appendSlashToUrl from '@libs/common/utils/URL/appendSlashToUrl';
import CustomHttpException from '../common/CustomHttpException';
import { Conference, ConferenceDocument } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import Attendee from './attendee.schema';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import PushNotificationService from '../pushNotification/pushNotification.service';

@Injectable()
class ConferencesService implements OnModuleInit {
  BBB_API_URL: string;

  BBB_SECRET: string;

  constructor(
    @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
    private readonly appConfigService: AppConfigService,
    private readonly groupsService: GroupsService,
    private readonly sseService: SseService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  onModuleInit() {
    void this.updateConferenceServiceConfig();
  }

  @OnEvent(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED)
  async updateConferenceServiceConfig() {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.CONFERENCES);
    const url = appConfig?.options.url?.trim() ?? '';

    this.BBB_API_URL = appendSlashToUrl(url);
    this.BBB_SECRET = appConfig?.options.apiKey || '';
  }

  @Interval(CONFERENCES_SYNC_INTERVAL_MS)
  async syncRunningConferencesStatus() {
    const runningConferences = await this.conferenceModel.find({ isRunning: true }).exec();
    await Promise.all(
      runningConferences.map(async (conference) => {
        const isRunning = await this.checkConferenceIsRunningWithBBB(conference.meetingID);
        if (!isRunning) {
          await this.update({ ...conference.toObject(), isRunning: false });
          const attendees = await this.groupsService.getInvitedMembers(
            conference.invitedGroups,
            conference.invitedAttendees,
          );
          this.sseService.sendEventToUsers(attendees, conference.meetingID, SSE_MESSAGE_TYPE.CONFERENCE_STOPPED);
        }
      }),
    );
  }

  async checkConferenceIsRunningWithBBB(meetingID: string): Promise<boolean> {
    const query = `meetingID=${meetingID}`;
    const checksum = this.createChecksum('isMeetingRunning', query);
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
          firstName: splitAtLastWhitespace(attendees.attendee.fullName)[0],
          lastName: splitAtLastWhitespace(attendees.attendee.fullName)[1],
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

  async create(createConferenceDto: CreateConferenceDto, currentUser: JWTUser): Promise<Conference | undefined> {
    this.throwIfAppIsNotProperlyConfigured();

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
      isPublic: createConferenceDto.isPublic,
      invitedAttendees: [...createConferenceDto.invitedAttendees, creator],
      invitedGroups: createConferenceDto.invitedGroups,
      isMeetingStarted: false,
    };

    try {
      return await this.conferenceModel.create(newConference);
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      const invitedMembersList = await this.groupsService.getInvitedMembers(
        createConferenceDto.invitedGroups,
        createConferenceDto.invitedAttendees,
      );
      const conference = await this.conferenceModel
        .findOne({ meetingID: newConference.meetingID }, { _id: 0, __v: 0 })
        .lean();
      if (conference) {
        this.sseService.sendEventToUsers(invitedMembersList, conference, SSE_MESSAGE_TYPE.CONFERENCE_CREATED);
      }
    }
  }

  async toggleConferenceIsRunning(meetingID: string, isRunning: boolean, username: string) {
    const { conference, isCreator } = await this.isCurrentUserTheCreator(meetingID, username);
    if (!isCreator) {
      throw new CustomHttpException(ConferencesErrorMessage.YouAreNotTheCreator, HttpStatus.UNAUTHORIZED);
    }
    const isConferenceRunningInBBB = await this.checkConferenceIsRunningWithBBB(conference.meetingID);

    if (isRunning) {
      await this.stopConference(conference, isConferenceRunningInBBB);
    } else {
      await this.startConference(conference, isConferenceRunningInBBB);
    }
  }

  async startConference(conference: Conference, shouldUpdateInBBB: boolean) {
    try {
      if (!shouldUpdateInBBB) {
        const query = `name=${encodeURIComponent(conference.name)}&meetingID=${conference.meetingID}`;
        const checksum = this.createChecksum('create', query);
        const url = `${this.BBB_API_URL}create?${query}&checksum=${checksum}`;

        const response = await axios.get<string>(url);
        const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
        ConferencesService.handleBBBApiError(result);
      }

      await this.update({ ...conference, isRunning: true });
    } catch (e) {
      throw new CustomHttpException(
        ConferencesErrorMessage.CouldNotStartConference,
        HttpStatus.BAD_GATEWAY,
        conference.meetingID,
      );
    } finally {
      const invitedMembersList = await this.groupsService.getInvitedMembers(
        conference.invitedGroups,
        conference.invitedAttendees,
      );

      await this.pushNotificationService.notifyUsernames(invitedMembersList, {
        title: `Konferenz gestartet: ${conference.name}`,
        body: `Die Konferenz "${conference.name}" wurde gestartet.`,
        data: {
          meetingID: conference.meetingID,
          type: 'conference_started',
        },
      });

      const publicConferencesSubscriber = conference.meetingID;
      this.sseService.sendEventToUsers(
        [...invitedMembersList, publicConferencesSubscriber],
        conference.meetingID,
        SSE_MESSAGE_TYPE.CONFERENCE_STARTED,
      );
    }
  }

  async stopConference(conference: Conference, shouldUpdateInBBB: boolean) {
    try {
      if (shouldUpdateInBBB) {
        const query = `meetingID=${conference.meetingID}`;
        const checksum = this.createChecksum('end', query);
        const url = `${this.BBB_API_URL}end?${query}&checksum=${checksum}`;

        const response = await axios.get<string>(url);
        const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
        ConferencesService.handleBBBApiError(result);
      }

      await this.update({ ...conference, isRunning: false });
    } catch (e) {
      throw new CustomHttpException(
        ConferencesErrorMessage.CouldNotStopConference,
        HttpStatus.BAD_GATEWAY,
        conference.meetingID,
      );
    } finally {
      const invitedMembersList = await this.groupsService.getInvitedMembers(
        conference.invitedGroups,
        conference.invitedAttendees,
      );
      const publicConferencesSubscriber = conference.meetingID;
      this.sseService.sendEventToUsers(
        [...invitedMembersList, publicConferencesSubscriber],
        conference.meetingID,
        SSE_MESSAGE_TYPE.CONFERENCE_STOPPED,
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

  async join(meetingID: string, user: JWTUser, password?: string): Promise<string> {
    const { preferred_username: username, given_name: givenName, family_name: familyName } = user;

    let role = ConferenceRole.Viewer;
    const { isCreator, conference } = await this.isCurrentUserTheCreator(meetingID, username);
    if (isCreator) {
      role = ConferenceRole.Moderator;
    } else {
      const invitedMembers = await this.groupsService.getInvitedMembers(
        conference.invitedGroups,
        conference.invitedAttendees,
      );
      const isInvitedMember = invitedMembers.find((member) => member === username);
      const isCorrectPassword = conference.password ? conference.password === password : true;
      if (!isInvitedMember && !isCorrectPassword) {
        throw new CustomHttpException(ConferencesErrorMessage.WrongPassword, HttpStatus.UNAUTHORIZED);
      }
    }

    try {
      const fullName = `${givenName} ${familyName}`;
      const query = `meetingID=${meetingID}&fullName=${encodeURIComponent(fullName)}&role=${role}&userID=${encodeURIComponent(username)}&redirect=true`;
      const checksum = this.createChecksum('join', query);

      return `${this.BBB_API_URL}join?${query}&checksum=${checksum}`;
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY);
    }
  }

  async joinPublicConference(joinDetails: JoinPublicConferenceDetails): Promise<string> {
    const { meetingId, password, name, userId } = joinDetails;
    if (!meetingId || !userId || !name) {
      throw new CustomHttpException(ConferencesErrorMessage.MissingMandatoryParameters, HttpStatus.BAD_REQUEST);
    }

    const conference = await this.findOne(meetingId);
    if (!conference) {
      throw new CustomHttpException(ConferencesErrorMessage.MeetingNotFound, HttpStatus.NOT_FOUND, { meetingId });
    } else if (conference.password !== password) {
      throw new CustomHttpException(ConferencesErrorMessage.WrongPassword, HttpStatus.UNAUTHORIZED);
    } else if (!conference.isRunning) {
      throw new CustomHttpException(ConferencesErrorMessage.ConferenceIsNotRunning, HttpStatus.NOT_FOUND);
    }

    try {
      const role = ConferenceRole.Viewer;

      const query = `meetingID=${meetingId}&fullName=${encodeURIComponent(name)}&role=${role}&userID=${encodeURIComponent(userId)}&redirect=true`;
      const checksum = this.createChecksum('join', query);

      return `${this.BBB_API_URL}join?${query}&checksum=${checksum}`;
    } catch (e) {
      throw new CustomHttpException(ConferencesErrorMessage.BbbServerNotReachable, HttpStatus.BAD_GATEWAY);
    }
  }

  private static replaceForeignConferencesPasswords(conferences: Partial<Conference>[], user?: JWTUser) {
    return conferences.map((conference) => {
      if (user && conference.creator?.username === user.preferred_username) return conference;
      return {
        ...conference,
        password: conference.password ? '*******' : '',
      };
    });
  }

  async findAllConferencesTheUserHasAccessTo(user: JWTUser): Promise<Partial<Conference>[]> {
    const groupPathConditions = user.ldapGroups.map((groupPath) => ({ 'invitedGroups.path': groupPath }));

    const conferencesToBeSynced = await this.conferenceModel
      .find({
        $or: [{ 'invitedAttendees.username': user.preferred_username }, ...groupPathConditions],
      })
      .exec();

    const syncedConferences = await this.syncConferencesInfoWithBBB(conferencesToBeSynced);
    return ConferencesService.replaceForeignConferencesPasswords(syncedConferences, user);
  }

  async findPublicConference(publicMeetingID: string): Promise<Partial<Conference> | null> {
    const conferenceToBeSynced = await this.conferenceModel
      .findOne({ meetingID: publicMeetingID, isPublic: true })
      .exec();

    if (!conferenceToBeSynced) return null;

    const { name, creator, isPublic, meetingID, password, isRunning } = (
      await this.syncConferencesInfoWithBBB([conferenceToBeSynced])
    )[0];

    return ConferencesService.replaceForeignConferencesPasswords([
      { name, creator, isPublic, meetingID, password, isRunning },
    ])[0];
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
      await Promise.all(
        conferences.map((conference) =>
          this.groupsService.getInvitedMembers(conference.invitedGroups, conference.invitedAttendees),
        ),
      )
    ).flat();

    this.sseService.sendEventToUsers(invitedMembersList, meetingIDs, SSE_MESSAGE_TYPE.CONFERENCE_DELETED);

    return true;
  }

  throwIfAppIsNotProperlyConfigured() {
    if (!this.BBB_API_URL || !this.BBB_SECRET) {
      throw new CustomHttpException(
        ConferencesErrorMessage.AppNotProperlyConfigured,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        ConferencesService.name,
      );
    }
  }

  createChecksum(method = '', query = '') {
    this.throwIfAppIsNotProperlyConfigured();

    const string = method + query + this.BBB_SECRET;

    return createHash('sha1').update(string).digest('hex');
  }

  private async syncConferencesInfoWithBBB(conferencesToBeSynced: ConferenceDocument[]): Promise<Conference[]> {
    const promises = conferencesToBeSynced.map(async (conference) => {
      const conferenceObject = conference.toObject() as ConferenceDocument;
      const query = `meetingID=${conference.meetingID}`;
      const checksum = this.createChecksum('getMeetingInfo', query);
      const url = `${this.BBB_API_URL}getMeetingInfo?${query}&checksum=${checksum}`;

      try {
        const response = await axios.get<string>(url);
        const result = await ConferencesService.parseXml<BbbResponseDto>(response.data);
        ConferencesService.handleBBBApiError(result);

        const isRunning = stringToBoolean(result.response.running);

        await this.update({ ...conferenceObject, isRunning });
        return { ...conferenceObject, isRunning, joinedAttendees: ConferencesService.getJoinedAttendees(result) };
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
