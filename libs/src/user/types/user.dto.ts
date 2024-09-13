import LdapGroups from '@libs/groups/types/ldapGroups';

class UserDto {
  _id?: string;

  username: string;

  firstName?: string;

  lastName?: string;

  email: string;

  ldapGroups: LdapGroups;

  password: string;

  mfaEnabled?: boolean;

  isTotpSet?: boolean;
}

export default UserDto;
