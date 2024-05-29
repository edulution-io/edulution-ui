import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Poll, PollChoice, PollDocument } from './types/poll.schema';
import CreatePollDto from './dto/create-poll.dto';
import PushChoiceDto from './dto/push-choice.dto';
import UpdatePollDto from './dto/update-poll.dto';

@Injectable()
class PollService {
  constructor(@InjectModel(Poll.name) private pollModel: Model<PollDocument>) {}

  async updatePoll(pollName: string, updatePollDto: UpdatePollDto): Promise<Poll | null> {
    return this.pollModel.findOneAndUpdate<Poll>({ pollName }, updatePollDto, { new: true }).exec();
  }

  async findAllPolls(): Promise<Poll[]> {
    return this.pollModel.find().exec();
  }

  async findPoll(pollName: string): Promise<Poll | null> {
    return this.pollModel.findOne<Poll>({ pollName: pollName }).exec();
  }

  async findPolls(pollNames: string[]): Promise<Poll[] | null> {
    return this.pollModel.find<Poll>({ pollName: { $in: pollNames } }).exec();
  }

  async removePoll(pollName: string): Promise<any> {
    return this.pollModel.deleteOne({ pollName: pollName }).exec();
  }

  async updateOrCreatePoll(createPollDto: CreatePollDto): Promise<Poll | null> {
    const poll = await this.pollModel
      .findOneAndUpdate<Poll>(
        { pollName: createPollDto.pollName },
        { ...createPollDto, created: createPollDto.created ? createPollDto.created.toString() : new Date().toString() },
      )
      .exec();

    if (poll != null) {
      return poll;
    }
    const newPoll = await this.pollModel.create(createPollDto);
    return newPoll;
  }

  async addUserChoice(pushChoiceDto: PushChoiceDto): Promise<Poll | null> {
    const { pollName, choice, userLabel, userName } = pushChoiceDto;
    const existingPoll = await this.pollModel.findOne<Poll>({ pollName: pollName }).exec();
    if (!existingPoll) {
      throw new Error('Poll not found');
    }

    const newChoices = existingPoll.choices;
    newChoices.push({ choice, userLabel, userName });

    const newPoll: UpdatePollDto = {
      choices: newChoices,
    };

    const updatedPoll = await this.updatePoll(pollName, newPoll);

    return updatedPoll;
  }

  async getChoices(pollName: string): Promise<PollChoice[] | undefined> {
    const existingPoll = await this.pollModel.findOne<Poll>({ pollName: pollName }).exec();
    if (!existingPoll) {
      throw new Error('Poll not found');
    }
    return existingPoll.choices;
  }
}

export default PollService;
