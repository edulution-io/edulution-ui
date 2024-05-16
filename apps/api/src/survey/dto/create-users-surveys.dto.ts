import { Survey } from '../types/survey.schema';
import { SurveyAnswer } from '../types/users-surveys.schema';

class CreateUsersSurveysDto {
  username: string;

  openSurveys: string[];

  createdSurveys: Survey[];

  answeredSurveys: SurveyAnswer[];
}

export default CreateUsersSurveysDto;
