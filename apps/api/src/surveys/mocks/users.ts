/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import emptyUsersSurveys from '@libs/survey/types/empty-user-surveys';
import { firstUsername, secondUsername, thirdUsername } from './usernames';
import { basicUserSurveysFirstUser } from './users-surveys';

export const firstMockUser = {
  email: 'first@example.com',
  username: firstUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: basicUserSurveysFirstUser,
};

export const secondMockUser = {
  email: 'third@example.com',
  username: secondUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: emptyUsersSurveys,
};

export const thirdMockUser = {
  email: 'third@example.com',
  username: thirdUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: emptyUsersSurveys,
};
