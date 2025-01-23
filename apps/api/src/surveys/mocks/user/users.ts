/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { firstUsername, secondUsername } from './usernames';

export const firstMockUser = {
  email: 'first@example.com',
  username: firstUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  firstName: 'given_name',
  lastName: 'family_name',
};

export const secondMockUser = {
  email: 'second@example.com',
  username: secondUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  firstName: 'given_name',
  lastName: 'family_name',
};
