import UsersSurveys from 'libs/src/survey/types/users-surveys';

class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

  usersSurveys?: UsersSurveys;
}

export default CreateUserDto;
