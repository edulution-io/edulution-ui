import UsersSurveys from '@libs/survey/types/users-surveys';
import { idOfCreateNewOpenSurvey, idOfOpenSurvey01 } from './open-surveys';
import { idOfAnswerFromFirstUserToAnswerTheOpenSurvey, idOfTheOpenSurvey } from './answer-the-open-survey';
import { idOfCreatedSurvey01, idOfCreateNewCreatedSurvey } from './created-surveys';
import {
  idOfAnswerFromFirstUserForAnsweredSurvey01,
  idOfAnswerFromFirstUserForAnsweredSurvey02,
} from './answered-surveys';
import { idOfDistributedSurvey, idOfAnswerFromFirstUserForDistributedSurvey } from './distributed-survey';
import { newId } from './unknown-survey-id';
import { idOfTheCreatedSurvey } from './update-the-created-survey';

// -------------------------
// Empty
// -------------------------
export const emptyUserSurveys: UsersSurveys = {
  openSurveys: [],
  createdSurveys: [],
  answeredSurveys: [],
};

// -------------------------
// Basic
// -------------------------
export const basicUserSurveysFirstUser: UsersSurveys = {
  openSurveys: [idOfTheOpenSurvey, idOfOpenSurvey01, idOfDistributedSurvey],
  createdSurveys: [idOfTheCreatedSurvey, idOfCreatedSurvey01, idOfDistributedSurvey],
  answeredSurveys: [
    idOfAnswerFromFirstUserForAnsweredSurvey01,
    idOfAnswerFromFirstUserForAnsweredSurvey02,
    idOfAnswerFromFirstUserForDistributedSurvey,
  ],
};

// -------------------------
// Create
// -------------------------
export const userSurveysAfterCreatingNewSurveyFirstUser: UsersSurveys = {
  openSurveys: basicUserSurveysFirstUser.openSurveys,
  createdSurveys: [...basicUserSurveysFirstUser.createdSurveys, idOfCreateNewCreatedSurvey],
  answeredSurveys: basicUserSurveysFirstUser.answeredSurveys,
};

export const userSurveysAfterCreatingNewOpenSurveyFirstUser: UsersSurveys = {
  openSurveys: [...basicUserSurveysFirstUser.openSurveys, idOfCreateNewOpenSurvey],
  createdSurveys: basicUserSurveysFirstUser.createdSurveys,
  answeredSurveys: basicUserSurveysFirstUser.answeredSurveys,
};

// -------------------------
// Answering
// -------------------------
export const userSurveysAfterAnsweringOpenSurveyFirstUser: UsersSurveys = {
  openSurveys: [idOfOpenSurvey01, idOfDistributedSurvey],
  createdSurveys: basicUserSurveysFirstUser.createdSurveys,
  answeredSurveys: [...basicUserSurveysFirstUser.answeredSurveys, idOfAnswerFromFirstUserToAnswerTheOpenSurvey],
};

// -------------------------
// Populate
// -------------------------
export const userSurveysAfterAddingNewOpenSurveyFirstUser: UsersSurveys = {
  openSurveys: [...basicUserSurveysFirstUser.openSurveys, newId],
  createdSurveys: basicUserSurveysFirstUser.createdSurveys,
  answeredSurveys: basicUserSurveysFirstUser.answeredSurveys,
};
export const userSurveysAfterAddingNewOpenSurveySecondUser: UsersSurveys = {
  openSurveys: [...emptyUserSurveys.openSurveys, newId],
  createdSurveys: emptyUserSurveys.createdSurveys,
  answeredSurveys: emptyUserSurveys.answeredSurveys,
};

// -------------------------
// DELETING
// -------------------------
export const userSurveysAfterRemoveOpenSurveyFirstUser: UsersSurveys = {
  openSurveys: [idOfOpenSurvey01, idOfDistributedSurvey],
  createdSurveys: basicUserSurveysFirstUser.createdSurveys,
  answeredSurveys: basicUserSurveysFirstUser.answeredSurveys,
};
export const userSurveysAfterRemoveCreatedSurveyFirstUser: UsersSurveys = {
  openSurveys: basicUserSurveysFirstUser.openSurveys,
  createdSurveys: [idOfCreatedSurvey01, idOfDistributedSurvey],
  answeredSurveys: basicUserSurveysFirstUser.answeredSurveys,
};
export const userSurveysAfterRemoveAnsweredSurveyFirstUser: UsersSurveys = {
  openSurveys: basicUserSurveysFirstUser.openSurveys,
  createdSurveys: basicUserSurveysFirstUser.createdSurveys,
  answeredSurveys: [idOfAnswerFromFirstUserForAnsweredSurvey02, idOfAnswerFromFirstUserForDistributedSurvey],
};

export const userSurveysAfterRemoveMultipleSurveysFirstUser: UsersSurveys = {
  openSurveys: [idOfTheOpenSurvey, idOfDistributedSurvey],
  createdSurveys: [idOfTheCreatedSurvey, idOfDistributedSurvey],
  answeredSurveys: [idOfAnswerFromFirstUserForAnsweredSurvey02, idOfAnswerFromFirstUserForDistributedSurvey],
};
export const userSurveysAfterRemoveDistributedSurveyFirstUser: UsersSurveys = {
  openSurveys: [idOfTheOpenSurvey, idOfOpenSurvey01],
  createdSurveys: [idOfTheCreatedSurvey, idOfCreatedSurvey01],
  answeredSurveys: [idOfAnswerFromFirstUserForAnsweredSurvey01, idOfAnswerFromFirstUserForAnsweredSurvey02],
};
