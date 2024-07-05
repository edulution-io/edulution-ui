import LdapGroups from './groups/ldapGroups';

class UserDto {
  _id?: string;

  preferred_username: string;

  email: string;

  ldapGroups: LdapGroups;

  password: string;

  mfaEnabled?: boolean;

  isTotpSet?: boolean;
}

export default UserDto;
