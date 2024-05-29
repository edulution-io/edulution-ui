import { PollChoice } from '../types/poll.schema';

class CreatePollDto {
  pollName: string;

  participants: string[];

  poll: string;

  choices: PollChoice[];

  saveNo?: number;

  created?: Date;

  isAnonymous?: boolean;

  isAnswerChangeable?: boolean;
}

export default CreatePollDto;
