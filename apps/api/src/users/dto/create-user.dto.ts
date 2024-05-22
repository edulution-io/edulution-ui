class CreateUserDto {
  username: string;

  email: string;

  password?: string;

  roles: string[];

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
