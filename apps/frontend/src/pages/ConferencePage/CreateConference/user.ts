export class User {
  username: string;

  email?: string;

  firstName?: string;

  lastName?: string;

  password?: string;

  roles?: string[];

  userSurveys: {
    openSurveys: number[];
    createdSurveys: number[];
    answeredSurveys: {
      surveyId: number;
      answer: JSON;
    }[];
  };
}

export default User;
