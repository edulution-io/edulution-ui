import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import UpdateConferenceDto from './dto/update-conference.dto';
import { Conference, ConferenceDocument } from './conference.schema';
import CreateConferenceDto from './dto/create-conference.dto';

@Injectable()
class ConferencesService {
  constructor(@InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>) {}

  async create(createConferenceDto: CreateConferenceDto): Promise<Conference> {
    const result = await this.conferenceModel.create(createConferenceDto);
    return result;
  }

  async findAll(): Promise<Conference[]> {
    return this.conferenceModel.find().exec();
  }

  async findOne(meetingID: string): Promise<Conference | null> {
    return this.conferenceModel.findOne<Conference>({ meetingID }).exec();
  }

  async update(meetingID: string, updateConferenceDto: UpdateConferenceDto): Promise<Conference | null> {
    return this.conferenceModel.findOneAndUpdate<Conference>({ meetingID }, updateConferenceDto, { new: true }).exec();
  }

  async remove(meetingID: string): Promise<any> {
    return this.conferenceModel.deleteOne({ meetingID }).exec();
  }
}

export default ConferencesService;
