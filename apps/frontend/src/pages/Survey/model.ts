export interface Survey {
  name: string;
  participants: string[];
  survey: JSON;
  isAnonymous: boolean;
  isAnswerChangeable: boolean;
}

export interface SurveysAPIsResponse {
  surveys: Survey[];
}

export type SurveyAnswer = {
  surveyname: string;
  answer: JSON;
};

export class UserSurveys {
  username: string;

  openSurveys: string[];

  createdSurveys: Survey[];

  answeredSurveys: SurveyAnswer[];
}
