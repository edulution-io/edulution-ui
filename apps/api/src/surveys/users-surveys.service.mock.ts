import mongoose from 'mongoose';
import { UsersSurveys } from './users-surveys.schema';
import {
  firstMockSurveyId,
  firstUsername,
  secondMockSurveyId,
  secondUsername,
  thirdMockSurveyAddNewPublicAnswer,
  thirdMockSurveyId,
  thirdUsername,
} from './surveys.service.mock';

// TODO move to lib is also declared in 'get-survey-editor-form-data.ts'
const EMPTY_JSON = {} as JSON;

export const newObjectId = new mongoose.Types.ObjectId(52653415245934);
export const unknownSurvey = new mongoose.Types.ObjectId(23523412341);

export const openSurvey = new mongoose.Types.ObjectId(1);
export const createdSurvey = new mongoose.Types.ObjectId(4);
export const answeredSurvey = new mongoose.Types.ObjectId(7);
export const distributedSurvey = new mongoose.Types.ObjectId(10);

export const surveyId02 = new mongoose.Types.ObjectId(2);
export const surveyId03 = new mongoose.Types.ObjectId(3);
export const surveyId05 = new mongoose.Types.ObjectId(5);
export const surveyId06 = new mongoose.Types.ObjectId(6);
export const surveyId08 = new mongoose.Types.ObjectId(8);
export const surveyId09 = new mongoose.Types.ObjectId(9);

export const mockedAnswer: JSON = JSON.parse('{"Frage1": "Antwort1"}');
export const openSurveys = [openSurvey, surveyId02, surveyId03, distributedSurvey];
export const createdSurveys = [createdSurvey, surveyId05, surveyId06, distributedSurvey];
export const answeredSurveyIds = [answeredSurvey, surveyId08, surveyId09, distributedSurvey];
export const answeredSurveys = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON },
  { surveyId: distributedSurvey, answer: EMPTY_JSON },
];

export const userSurveys: UsersSurveys = {
  openSurveys,
  createdSurveys,
  answeredSurveys,
};

export const thirdUser = {
  email: 'first@example.com',
  username: thirdUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: {
    openSurveys: [thirdMockSurveyId],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [{ surveyId: firstMockSurveyId, answer: mockedAnswer }],
  },
};

export const thirdUserAfterDeletingFirstSurvey = {
  ...thirdUser,
  usersSurveys: {
    openSurveys: [thirdMockSurveyId],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [],
  },
};

export const thirdUserAfterDeletingRemaining = {
  ...thirdUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [],
    answeredSurveys: [],
  },
};

export const thirdUserAfterAddedAnswer = {
  ...thirdUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [
      { surveyId: firstMockSurveyId, answer: mockedAnswer },
      { surveyId: thirdMockSurveyId, answer: thirdMockSurveyAddNewPublicAnswer },
    ],
  },
};

export const firstMockUser = {
  username: firstUsername,
  usersSurveys: userSurveys,
};
export const secondMockUser = {
  username: secondUsername,
  usersSurveys: userSurveys,
};

export const openSurveysAfterRemoveOpenSurvey = [surveyId02, surveyId03, distributedSurvey];
export const createdSurveysAfterRemoveCreatedSurvey = [surveyId05, surveyId06, distributedSurvey];
export const answeredSurveysAfterRemoveAnsweredSurvey = [
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON },
  { surveyId: distributedSurvey, answer: EMPTY_JSON },
];
export const userSurveysAfterRemoveOpenSurvey: UsersSurveys = {
  openSurveys: openSurveysAfterRemoveOpenSurvey,
  createdSurveys,
  answeredSurveys,
};
export const userSurveysAfterRemoveCreatedSurvey: UsersSurveys = {
  openSurveys,
  createdSurveys: createdSurveysAfterRemoveCreatedSurvey,
  answeredSurveys,
};
export const userSurveysAfterRemoveAnsweredSurvey: UsersSurveys = {
  openSurveys,
  createdSurveys,
  answeredSurveys: answeredSurveysAfterRemoveAnsweredSurvey,
};

export const openSurveysAfterRemoveDistributedSurvey = [openSurvey, surveyId02, surveyId03];
export const createdSurveysAfterRemoveDistributedSurvey = [createdSurvey, surveyId05, surveyId06];
export const answeredSurveysAfterRemoveDistributedSurvey = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON },
];

export const userSurveysAfterRemoveDistributedSurvey: UsersSurveys = {
  openSurveys: openSurveysAfterRemoveDistributedSurvey,
  createdSurveys: createdSurveysAfterRemoveDistributedSurvey,
  answeredSurveys: answeredSurveysAfterRemoveDistributedSurvey,
};

export const openSurveysAfterAddOpenUnknownSurvey = [
  openSurvey,
  surveyId02,
  surveyId03,
  distributedSurvey,
  unknownSurvey,
];
export const userSurveysAfterAddOpenUnknownSurvey: UsersSurveys = {
  openSurveys: openSurveysAfterAddOpenUnknownSurvey,
  createdSurveys,
  answeredSurveys,
};

export const createdSurveysAfterAddCreatedUnknownSurvey = [
  createdSurvey,
  surveyId05,
  surveyId06,
  distributedSurvey,
  unknownSurvey,
];
export const userSurveysAfterAddCreatedUnknownSurvey: UsersSurveys = {
  openSurveys,
  createdSurveys: createdSurveysAfterAddCreatedUnknownSurvey,
  answeredSurveys,
};

export const openSurveysAfterAddAnswerForOpenSurvey = [surveyId02, surveyId03, distributedSurvey];
export const answeredSurveysAfterAddAnswerForOpenSurvey = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON },
  { surveyId: distributedSurvey, answer: EMPTY_JSON },
  { surveyId: openSurvey, answer: mockedAnswer },
];
export const userSurveysAfterAddAnswerForOpenSurvey: UsersSurveys = {
  openSurveys: openSurveysAfterAddAnswerForOpenSurvey,
  createdSurveys,
  answeredSurveys: answeredSurveysAfterAddAnswerForOpenSurvey,
};
