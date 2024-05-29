/*
 *  This file contains the model classes for the frontend of the application
 *  and includes copies of all the necessary backend type
 */

import Attendee from '@/pages/ConferencePage/dto/attendee';

export type PollChoices = {
  choice: string;
  userText: string;
  userName?: string;
};

export interface Poll {
  pollName: string;
  poll: string;
  participants: Attendee[];
  choices: PollChoices[];
  created?: Date;
  isAnonymous?: boolean;
}

export class UserPolls {
  username: string;

  openPolls: string[];

  createdPolls: string[];

  answeredPolls: PollChoices[];
}
