/* eslint-disable */

import mongoose from 'mongoose';
import { UsersSurveys, UsersSurveysDocument } from './users-surveys.schema';

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

export const first_username = 'pupil1-name1';
export const first_participant = {
  username: first_username,
  lastName: 'name1',
  firstName: 'pupil1',
  label: 'pupil1-name1',
  value: first_username,
};
export const second_username = 'pupil2-name2';
export const second_participant = {
  username: second_username,
  lastName: 'name2',
  firstName: 'pupil2',
  label: 'pupil2-name2',
  value: second_username,
};

export const mocked_participants = [first_participant, second_participant];

export const mockedAnswer = JSON.parse('{"Frage1": "Antwort1"}');
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
  openSurveys: openSurveys,
  createdSurveys: createdSurveys,
  answeredSurveys: answeredSurveys,
};

export const first_mockedUser = {
  username: first_username,
  usersSurveys: userSurveys,
};
export const second_mockedUser = {
  username: second_username,
  usersSurveys: userSurveys,
};
export const mockedUsers = [first_mockedUser, second_mockedUser];

export const openSurveys_afterRemove_openSurveys = [surveyId02, surveyId03, distributedSurvey];
export const createdSurveys_afterRemove_createdSurvey = [surveyId05, surveyId06, distributedSurvey];
export const answeredSurveys_afterRemove_answeredSurvey = [
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON },
  { surveyId: distributedSurvey, answer: EMPTY_JSON },
];
export const Users_UserSurveys_afterRemove_openSurvey: UsersSurveys = {
  openSurveys: openSurveys_afterRemove_openSurveys,
  createdSurveys: createdSurveys,
  answeredSurveys: answeredSurveys,
};
export const Users_UserSurveys_afterRemove_createdSurvey: UsersSurveys = {
  openSurveys: openSurveys,
  createdSurveys: createdSurveys_afterRemove_createdSurvey,
  answeredSurveys: answeredSurveys,
};
export const Users_UserSurveys_afterRemove_answeredSurvey: UsersSurveys = {
  openSurveys: openSurveys,
  createdSurveys: createdSurveys,
  answeredSurveys: answeredSurveys_afterRemove_answeredSurvey,
};

export const openSurveys_afterRemove_distributedSurvey = [openSurvey, surveyId02, surveyId03];
export const createdSurveys_afterRemove_distributedSurvey = [createdSurvey, surveyId05, surveyId06];
export const answeredSurveys_afterRemove_distributedSurvey = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON }
];
export const Users_UserSurveys_afterRemove_distributedSurvey: UsersSurveys = {
  openSurveys: openSurveys_afterRemove_distributedSurvey,
  createdSurveys: createdSurveys_afterRemove_distributedSurvey,
  answeredSurveys: answeredSurveys_afterRemove_distributedSurvey,
};

export const openSurveys_afterAddOpen_unknownSurvey = [openSurvey, surveyId02, surveyId03, distributedSurvey, unknownSurvey];
export const Users_UserSurveys_afterAddOpen_unknownSurvey: UsersSurveys = {
  openSurveys: openSurveys_afterAddOpen_unknownSurvey,
  createdSurveys: createdSurveys,
  answeredSurveys: answeredSurveys,
};

export const createdSurveys_afterAddCreated_unknownSurvey = [createdSurvey, surveyId05, surveyId06, distributedSurvey, unknownSurvey];
export const Users_UserSurveys_afterAddCreated_unknownSurvey: UsersSurveys = {
  openSurveys: openSurveys,
  createdSurveys: createdSurveys_afterAddCreated_unknownSurvey,
  answeredSurveys: answeredSurveys,
};

export const openSurveys_afterAddAnswer_openSurvey = [surveyId02, surveyId03, distributedSurvey];
export const answeredSurveys_afterAddAnswer_openSurvey = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: surveyId08, answer: EMPTY_JSON },
  { surveyId: surveyId09, answer: EMPTY_JSON },
  { surveyId: distributedSurvey, answer: EMPTY_JSON },
  { surveyId: openSurvey, answer: mockedAnswer },
];
export const Users_UserSurveys_afterAddAnswer_openSurvey: UsersSurveys = {
  openSurveys: openSurveys_afterAddAnswer_openSurvey,
  createdSurveys: createdSurveys,
  answeredSurveys: answeredSurveys_afterAddAnswer_openSurvey,
};

export const first_UserSurveysDocument: UsersSurveysDocument = {
  ...userSurveys,
  // _id: '60d6c47e4094a113f0d0fe03',
  save: jest.fn().mockResolvedValue(userSurveys),
  remove: jest.fn().mockResolvedValue(userSurveys),
} as unknown as UsersSurveysDocument;

export const second_UserSurveysDocument: UsersSurveysDocument = {
  ...userSurveys,
  // _id: '35d3c36e45674a89076f8d3fe55',
  save: jest.fn().mockResolvedValue(userSurveys),
  remove: jest.fn().mockResolvedValue(userSurveys),
} as unknown as UsersSurveysDocument;

export const mockedUserSurveysDocuments = [first_UserSurveysDocument, second_UserSurveysDocument];

