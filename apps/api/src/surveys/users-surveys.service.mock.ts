import mongoose from 'mongoose';
import UsersSurveys from '@libs/survey/types/users-surveys';
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

export const surveyAnswerAId = new mongoose.Types.ObjectId(11);
export const surveyAnswerBId = new mongoose.Types.ObjectId(12);
export const surveyAnswerCId = new mongoose.Types.ObjectId(13);
export const surveyAnswerDId = new mongoose.Types.ObjectId(14);

export const surveyAnswerAddAnswerId = new mongoose.Types.ObjectId(15);

export const surveyAnswerA = {
  _id: surveyAnswerAId,
  id: surveyAnswerAId,
  survey: answeredSurvey,
  user: firstUsername,
  answer: mockedAnswer,
};
export const surveyAnswerB = {
  _id: surveyAnswerBId,
  id: surveyAnswerBId,
  survey: surveyId08,
  user: firstUsername,
  answer: EMPTY_JSON,
};
export const surveyAnswerC = {
  _id: surveyAnswerCId,
  id: surveyAnswerCId,
  survey: surveyId09,
  user: firstUsername,
  answer: EMPTY_JSON,
};
export const surveyAnswerD = {
  _id: surveyAnswerDId,
  id: surveyAnswerDId,
  survey: distributedSurvey,
  user: firstUsername,
  answer: EMPTY_JSON,
};

export const surveyAnswerAddAnswer = {
  _id: surveyAnswerAddAnswerId,
  id: surveyAnswerAddAnswerId,
  survey: openSurvey,
  user: firstUsername,
  answer: mockedAnswer,
};

export const openSurveys = [openSurvey, surveyId02, surveyId03, distributedSurvey];
export const createdSurveys = [createdSurvey, surveyId05, surveyId06, distributedSurvey];
export const answeredSurveyIds = [answeredSurvey, surveyId08, surveyId09, distributedSurvey];
export const answeredSurveys = [
  surveyAnswerAId,
  surveyAnswerBId,
  surveyAnswerCId,
  surveyAnswerDId,
];

export const userSurveys: UsersSurveys = {
  openSurveys,
  createdSurveys,
  answeredSurveys,
};

export const firstMockUser = {
  username: firstUsername,
  usersSurveys: userSurveys,
};
export const secondMockUser = {
  username: secondUsername,
  usersSurveys: userSurveys,
};

export const thirdMockUser = {
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

export const fourthMockUser = {
  email: 'fourth@example.com',
  username: 'NOT_EXISTING_USER_NAME',
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [],
    answeredSurveys: [],
  },
};


export const thirdMockUserAfterDeletingFirstSurvey = {
  ...thirdMockUser,
  usersSurveys: {
    openSurveys: [thirdMockSurveyId],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [],
  },
};

export const thirdMockUserAfterDeletingRemaining = {
  ...thirdMockUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [],
    answeredSurveys: [],
  },
};

export const thirdMockUserAfterAddedAnswer = {
  ...thirdMockUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [
      { surveyId: firstMockSurveyId, answer: mockedAnswer },
      { surveyId: thirdMockSurveyId, answer: thirdMockSurveyAddNewPublicAnswer },
    ],
  },
};

export const openSurveysAfterRemoveOpenSurvey = [surveyId02, surveyId03, distributedSurvey];
export const createdSurveysAfterRemoveCreatedSurvey = [surveyId05, surveyId06, distributedSurvey];
export const answeredSurveysAfterRemoveAnsweredSurvey = [surveyAnswerBId, surveyAnswerCId, surveyAnswerDId];

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
export const answeredSurveysAfterRemoveDistributedSurvey = [surveyAnswerAId, surveyAnswerBId, surveyAnswerCId];

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
export const answeredSurveysAfterAddAnswerForOpenSurvey = [surveyAnswerAId, surveyAnswerBId, surveyAnswerCId, surveyAnswerDId, surveyAnswerAddAnswerId];

export const userSurveysAfterAddAnswerForOpenSurvey: UsersSurveys = {
  openSurveys: openSurveysAfterAddAnswerForOpenSurvey,
  createdSurveys,
  answeredSurveys: answeredSurveysAfterAddAnswerForOpenSurvey,
};
