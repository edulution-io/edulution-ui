class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

  usersSurveys?: {
    openSurveys?: number[];
    createdSurveys?: number[];
    answeredSurveys?: {
      surveyId: number;
      answer?: JSON;
    }[];
  };
}

export default CreateUserDto;
