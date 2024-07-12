import LdapGroups from '@libs/user/types/groups/ldapGroups';
import UsersSurveys from 'libs/src/survey/types/users-surveys';

class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  ldapGroups: LdapGroups;

  usersSurveys?: UsersSurveys;
}

export default CreateUserDto;
