import { Body, Controller, Delete, Get, Post, Query, Patch } from '@nestjs/common';
import PollService from './poll.service';
import DeletePollDto from './dto/delete-poll.dto';

import UsersPollsService from './users-polls.service';
import UserPollSearchTypes from './types/user-poll-search-types-enum';
import { Poll } from './types/poll.schema';
import CreatePollDto from './dto/create-poll.dto';
import FindPollDto from './dto/find-poll.dto';
import PushChoiceDto from './dto/push-choice.dto';
import { GetUsername } from '../../common/decorators/getUser.decorator';

@Controller('polls')
class PollsController {
  constructor(
    private readonly pollService: PollService,
    private readonly usersPollsService: UsersPollsService,
  ) {}

  @Get()
  async find(@Query() params: FindPollDto, @GetUsername() username: string) {
    const { search, pollName, pollNames } = params;
    if (search) {
      switch (search) {
        case UserPollSearchTypes.OPEN:
          return this.pollService.findPolls(await this.usersPollsService.getOpenPollNames(username));

        case UserPollSearchTypes.CREATED:
          return this.pollService.findPolls(await this.usersPollsService.getCreatedPollNames(username));

        case UserPollSearchTypes.ANSWERED:
          return this.pollService.findPolls(await this.usersPollsService.getAnsweredPollNames(username));

        case UserPollSearchTypes.ALL:
        default:
          return this.pollService.findAllPolls();
      }
    }

    // only fetching a specific survey
    if (pollName) {
      return this.pollService.findPoll(pollName);
    }

    // fetching multiple specific surveys
    if (pollNames) {
      return this.pollService.findPolls(pollNames);
    }

    // fetch all surveys
    return this.pollService.findAllPolls();
  }

  @Post()
  async createOrUpdate(@Body() createPollDto: CreatePollDto, @GetUsername() username: string) {
    // const poll = new Model(JSON.parse(createPollDto.poll));

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newCreateSurveyDto = { ...createPollDto, poll: JSON.parse(createPollDto.poll) };

    const newPoll: Poll | null = await this.pollService.updateOrCreatePoll(newCreateSurveyDto);
    if (newPoll == null) {
      throw new Error('Survey was not found and we were not able to create a new survey given the parameters');
    }

    const { pollName, participants } = newPoll;
    await this.usersPollsService.addToCreatedPolls(username, pollName);
    await this.usersPollsService.populatePoll(participants, pollName);
  }

  @Delete()
  remove(@Body() deletePollDto: DeletePollDto) {
    const pollName = deletePollDto.pollName;
    // this.usersPollsService.onRemovePoll(pollName);
    return this.pollService.removePoll(pollName);
  }

  @Patch()
  async manageUsersSurveys(@Body() pushChoiceDto: PushChoiceDto, @GetUsername() username: string) {
    const { pollName, choice, userLabel } = pushChoiceDto;

    const updatedPoll = this.pollService.addUserChoice({ pollName, choice, userLabel, userName: username });
    if (updatedPoll != null) {
      await this.usersPollsService.movePollFromOpenToAnsweredPolls(username, pollName);
    }
  }
}

export default PollsController;
