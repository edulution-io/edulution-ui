import LdapGroups from './groups/ldapGroups';

class UserDto {
  preferred_username: string;

  email: string;

  ldapGroups: LdapGroups;

  password: string;
}

export default UserDto;
