import LdapGroups from '@libs/groups/types/ldapGroups';

class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  ldapGroups: LdapGroups;

  mfaEnabled?: boolean;

  isTotpSet?: boolean;
}

export default CreateUserDto;
