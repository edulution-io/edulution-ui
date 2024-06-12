// This DTO is based on a third-party object definition from Keycloak API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type JWTUser = {
  exp: number;
  iat: number;
  jti: string;
  iss: string;
  sub: string;
  typ: string;
  azp: string;
  session_state: string;
  resource_access: {
    [key: string]: {
      roles: string[];
    };
  };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
  ldapGroups: string[];
};

export default JWTUser;
