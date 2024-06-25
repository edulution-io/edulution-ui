import { UsersSurveys, UsersSurveysDocument } from "./types/users-surveys.schema";

// TODO move to lib is also declared in 'get-survey-editor-form-data.ts'
const EMPTY_JSON = JSON.parse('{}');

export const first_username = 'pupil1-name1';
export const first_participant = {
  username: first_username,
  lastName: 'name1',
  firstName: 'pupil1',
};
export const second_username = 'pupil2-name2';
export const second_participant = {
  username: second_username,
  lastName: 'name2',
  firstName: 'pupil2',
};

export const mocked_participants = [first_participant, second_participant];

export const openSurvey = 1;
export const createdSurvey = 4;
export const answeredSurvey = 7;
export const distributedSurvey = 10;

export const mockedAnswer = JSON.parse('{"Frage1": "Antwort1"}');
export const openSurveys = [openSurvey, 2, 3, distributedSurvey];
export const createdSurveys = [createdSurvey, 5, 6, distributedSurvey];

export const answeredSurveyIds = [answeredSurvey, 8, 9, distributedSurvey];
export const answeredSurveys = [
  { surveyId: answeredSurveyIds[0], answer: mockedAnswer },
  { surveyId: answeredSurveyIds[1], answer: EMPTY_JSON },
  { surveyId: answeredSurveyIds[2], answer: EMPTY_JSON },
  { surveyId: answeredSurveyIds[3], answer: EMPTY_JSON },
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

export const openSurveys_afterRemove_openSurveys = [2, 3, distributedSurvey];
export const createdSurveys_afterRemove_createdSurvey = [5, 6, distributedSurvey];
export const answeredSurveys_afterRemove_answeredSurvey = [
  { surveyId: 8, answer: EMPTY_JSON },
  { surveyId: 9, answer: EMPTY_JSON },
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

export const openSurveys_afterRemove_distributedSurvey = [openSurvey, 2, 3];
export const createdSurveys_afterRemove_distributedSurvey = [createdSurvey, 5, 6];
export const answeredSurveys_afterRemove_distributedSurvey = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: 8, answer: EMPTY_JSON },
  { surveyId: 9, answer: EMPTY_JSON }
];
export const Users_UserSurveys_afterRemove_distributedSurvey: UsersSurveys = {
  openSurveys: openSurveys_afterRemove_distributedSurvey,
  createdSurveys: createdSurveys_afterRemove_distributedSurvey,
  answeredSurveys: answeredSurveys_afterRemove_distributedSurvey,
};

export const unknownSurvey = 23523412341;
export const openSurveys_afterAddOpen_unknownSurvey = [openSurvey, 2, 3, distributedSurvey, unknownSurvey];
export const Users_UserSurveys_afterAddOpen_unknownSurvey: UsersSurveys = {
  openSurveys: openSurveys_afterAddOpen_unknownSurvey,
  createdSurveys: createdSurveys,
  answeredSurveys: answeredSurveys,
};

export const createdSurveys_afterAddCreated_unknownSurvey = [createdSurvey, 5, 6, distributedSurvey, unknownSurvey];
export const Users_UserSurveys_afterAddCreated_unknownSurvey: UsersSurveys = {
  openSurveys: openSurveys,
  createdSurveys: createdSurveys_afterAddCreated_unknownSurvey,
  answeredSurveys: answeredSurveys,
};

export const openSurveys_afterAddAnswer_openSurvey = [2, 3, distributedSurvey];
export const answeredSurveys_afterAddAnswer_openSurvey = [
  { surveyId: answeredSurvey, answer: mockedAnswer },
  { surveyId: 8, answer: EMPTY_JSON },
  { surveyId: 9, answer: EMPTY_JSON },
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
  _id: '60d6c47e4094a113f0d0fe03',
  save: jest.fn().mockResolvedValue(userSurveys),
  remove: jest.fn().mockResolvedValue(userSurveys),
} as unknown as UsersSurveysDocument;

export const second_UserSurveysDocument: UsersSurveysDocument = {
  ...userSurveys,
  _id: '35d3c36e45674a89076f8d3fe55',
  save: jest.fn().mockResolvedValue(userSurveys),
  remove: jest.fn().mockResolvedValue(userSurveys),
} as unknown as UsersSurveysDocument;

export const mockedUserSurveysDocuments = [first_UserSurveysDocument, second_UserSurveysDocument];

