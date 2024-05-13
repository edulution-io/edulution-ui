import { Survey } from '../survey.schema';
import { SurveyAnswer } from '../users-surveys.schema';

class CreateUsersSurveysDto {
  username: string;

  openSurveys: string[];

  createdSurveys: Survey[];

  answeredSurveys: SurveyAnswer[];
}

export default CreateUsersSurveysDto;
