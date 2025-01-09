import LdapGroups from '@libs/groups/types/ldapGroups';

class UserDto {
  _id?: string;

  username: string;

  firstName?: string;

  lastName?: string;

  email: string;

  ldapGroups: LdapGroups;

  password: string;

  encryptKey: string;

  mfaEnabled?: boolean;

  language?: string;
}

export default UserDto;
