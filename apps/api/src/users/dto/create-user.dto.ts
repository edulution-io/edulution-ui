class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

  mfaEnabled?: boolean;

  isTotpSet?: boolean;

  usersSurveys: {
    openSurveys: number[];
    createdSurveys: number[];
    answeredSurveys: {
      surveyId: number;
      answer?: JSON;
    }[];
  };
}

export default CreateUserDto;
