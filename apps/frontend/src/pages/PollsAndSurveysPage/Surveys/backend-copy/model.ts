/*
 *  This file contains the model classes for the frontend of the application
 *  and includes copies of all the necessary backend type
 */

import Attendee from '@/pages/ConferencePage/dto/attendee';

export type SurveyAnswer = {
  answer: string;
};

export interface Survey {
  surveyname: string;
  survey: string;
  participants: Attendee[];
  saveNo: number;
  created: Date;
  deadline?: Date;
  isAnonymous: boolean;
  isAnswerChangeable: boolean;
}

export class UserSurveys {
  username: string;

  openSurveys: string[];

  createdSurveys: string[];

  answeredSurveys: SurveyAnswer[];
}
