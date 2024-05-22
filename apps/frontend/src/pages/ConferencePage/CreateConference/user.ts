export class User {
  username: string;

  email?: string;

  firstName?: string;

  lastName?: string;

  password?: string;

  roles?: string[];

  userSurveys: {
    openSurveys: string[];
    createdSurveys: string[];
    answeredSurveys: {
      surveyname: string;
      answer: JSON;
    }[];
  };
}

export default User;
