import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as xml2js from 'xml2js';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Conference, ConferenceDocument } from './conference.schema';
import CreateConferenceDto from './dto/create-conference.dto';
import CreateBbbMeetingDto from './bbb-api/create-bbb-meeting.dto';
import BbbResponseDto from './bbb-api/bbb-response.dto';

const BBB_API_URL = 'https://ncc.netzint.de/bigbluebutton/api/';
const BBB_SECRET = '44aae5eec7adc10e6eabbe30e0b0c0e242ca3c6495c24a924c9e09317b7e585e';

@Injectable()
class ConferencesService {
  constructor(@InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>) {}

  async create(createConferenceDto: CreateConferenceDto, creator: string): Promise<Conference> {
    const newConference = {
      name: createConferenceDto.name,
      creator,
      meetingID: uuidv4(),
      password: createConferenceDto.password,
      attendees: createConferenceDto.attendees,
      isMeetingStarted: false,
    };

    const result = await this.conferenceModel.create(newConference);
    return result;
  }

  async startConference(meetingID: string): Promise<Conference> {
    const conference = await this.findOne(meetingID);
    if (!conference) {
      throw new HttpException(`No meeting with ID ${meetingID} found`, HttpStatus.SERVICE_UNAVAILABLE);
    }

    const query = `name=${encodeURIComponent(conference.name)}&meetingID=${meetingID}`;
    const checksum = this.createChecksum('create', query);
    const url = `${BBB_API_URL}create?${query}&checksum=${checksum}`;

    try {
      const response = await axios.get<string>(url);
      const result = await this.parseXml(response.data);
      this.handleBBBApiError(result);

      conference.isRunning = true;
      return conference;
    } catch (e) {
      Logger.error(e, ConferencesService.name);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async findAll(currentUser: string): Promise<Conference[]> {
    return this.conferenceModel.find({ attendees: currentUser }).exec();
  }

  async findOne(meetingID: string): Promise<Conference | null> {
    return this.conferenceModel.findOne<Conference>({ meetingID }).exec();
  }

  async update(conference: Conference): Promise<Conference | null> {
    return this.conferenceModel
      .findOneAndUpdate<Conference>({ meetingID: conference.meetingID }, conference, { new: true })
      .exec();
  }

  async remove(meetingIDs: string[]): Promise<boolean> {
    await this.conferenceModel.deleteMany({ meetingID: { $in: meetingIDs } }).exec();
    return true;
  }

  handleBBBApiError = (result: BbbResponseDto) => {
    console.log(result);
    if (result.response.returncode !== 'SUCCESS') {
      throw new Error('BBB API did not return SUCCESS returncode');
    }
  };

  createChecksum(method = '', query = '') {
    const string = method + query + BBB_SECRET;
    console.log(`checksum string ${string}`);
    return crypto.createHash('sha1').update(string).digest('hex');
  }

  parseXml(xml: string): Promise<BbbResponseDto> {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result as BbbResponseDto);
        }
      });
    });
  }

  normalizeConferences(bbbMeetingDtos: CreateBbbMeetingDto[]): CreateConferenceDto[] {
    const conferences = bbbMeetingDtos.map((meeting) => {
      let attendees: string[] = [];
      if (meeting.attendees?.attendee) {
        if (!Array.isArray(meeting.attendees.attendee)) {
          attendees = [`${meeting.attendees.attendee.role}: ${meeting.attendees.attendee.fullName}`];
        } else {
          attendees = meeting.attendees.attendee.map((a) => `${a.role}: ${a.fullName}`);
        }
      }

      return {
        name: meeting.meetingName,
        meetingID: meeting.meetingID,
        attendees,
      };
    });

    return conferences;
  }
}

export default ConferencesService;
