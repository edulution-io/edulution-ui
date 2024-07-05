import LdapGroups from '@libs/user/types/groups/ldapGroups';

class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  ldapGroups: LdapGroups;
}

export default CreateUserDto;
