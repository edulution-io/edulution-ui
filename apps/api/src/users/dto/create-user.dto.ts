import LdapGroups from '@libs/groups/types/ldapGroups';

class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  ldapGroups: LdapGroups;
}

export default CreateUserDto;
