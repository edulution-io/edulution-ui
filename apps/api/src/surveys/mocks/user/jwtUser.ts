import JwtUser from '@libs/user/types/jwt/jwtUser';
import { firstUsername, secondUsername } from './usernames';

export const firstMockJWTUser: JwtUser = {
  exp: 0,
  iat: 0,
  jti: '',
  iss: '',
  sub: '',
  typ: '',
  azp: '',
  session_state: '',
  resource_access: {},
  scope: '',
  sid: '',
  email_verified: false,
  name: 'pupil1-name1',
  preferred_username: firstUsername,
  given_name: 'given_name',
  family_name: 'family_name',
  email: 'first@example.com',
  ldapGroups: [],
};

export const secondMockJWTUser: JwtUser = {
  exp: 0,
  iat: 0,
  jti: '',
  iss: '',
  sub: '',
  typ: '',
  azp: '',
  session_state: '',
  resource_access: {},
  scope: '',
  sid: '',
  email_verified: false,
  name: 'pupil2-name2',
  preferred_username: secondUsername,
  given_name: 'given_name',
  family_name: 'family_name',
  email: 'second@example.com',
  ldapGroups: [],
};
