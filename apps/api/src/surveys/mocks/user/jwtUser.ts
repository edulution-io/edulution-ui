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
  name: '',
  preferred_username: firstUsername,
  given_name: 'firstName',
  family_name: 'lastName',
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
  name: '',
  preferred_username: secondUsername,
  given_name: 'firstName',
  family_name: 'lastName',
  email: 'second@example.com',
  ldapGroups: [],
};
