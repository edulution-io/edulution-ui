/*
 *  This file contains the model classes for the frontend of the application
 *  and includes copies of all the necessary backend type
 */

export enum SurveyType {
  FORMS = 'FORMS',
  POLL = 'POLL',
}

export interface Survey {
  surveyname: string;
  participants: string[];
  survey: JSON;
  type: SurveyType;
  isAnonymous: boolean;
  isAnswerChangeable: boolean;
}

export type SurveyAnswer = {
  surveyname: string;
  answer: string;
};

export class UserSurveys {
  username: string;

  openSurveys: string[];

  createdSurveys: string[];

  answeredSurveys: SurveyAnswer[];
}
