import { answeredSurvey01, answeredSurvey02, idOfAnsweredSurvey01, idOfAnsweredSurvey02 } from './answered-surveys';
import { idOfTheOpenSurvey, theOpenSurvey } from './answer-the-open-survey';
import { idOfOpenSurvey01, openSurvey01 } from './open-surveys';
import { idOfTheCreatedSurvey, theCreatedSurvey } from './update-the-created-survey';
import { createdSurvey01, idOfCreatedSurvey01 } from './created-surveys';
import { distributedSurvey, idOfDistributedSurvey } from './distributed-survey';

export const mockedSurveyIds = [
  idOfTheCreatedSurvey,
  idOfCreatedSurvey01,
  idOfTheOpenSurvey,
  idOfOpenSurvey01,
  idOfAnsweredSurvey01,
  idOfAnsweredSurvey02,
  idOfDistributedSurvey,
];

export const mockedSurveys = [
  theCreatedSurvey,
  createdSurvey01,
  theOpenSurvey,
  openSurvey01,
  answeredSurvey01,
  answeredSurvey02,
  distributedSurvey,
];
