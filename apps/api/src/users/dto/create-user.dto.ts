class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

  mfaEnabled?: boolean;

  isTotpSet?: boolean;

  usersPolls: {
    openPolls: string[];
    createdPolls: string[];
    answeredPolls: string[];
  };

  usersSurveys: {
    openSurveys: string[];
    createdSurveys: string[];
    answeredSurveys: {
      surveyname: string;
      answer: string;
    }[];
  };
}

export default CreateUserDto;
