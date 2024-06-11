import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../users/user.schema';
// import { Conference, ConferenceDocument } from '../conferences/conference.schema';
import ImapFlowGetMailsClient from './imapFlowGetMailsClient';

@Injectable()
class NotificationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    // @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
  ) {}

  async getMails(username: string): Promise<void> {
    const ImapClient = new ImapFlowGetMailsClient(username);
    await ImapClient.connect();
    await ImapClient.getMails();
  }

  async getOpenSurveys(username: string): Promise<number[]> {
    const existingUser = await this.userModel.findOne<User>({ username }).exec();
    if (!existingUser) {
      throw new Error('User not found');
    }

    return existingUser.usersSurveys?.openSurveys || [];
  }

  // async getCurrentConferences(username: string): Promise<Conference[]> {
  //
  // }
}

export default NotificationService;
