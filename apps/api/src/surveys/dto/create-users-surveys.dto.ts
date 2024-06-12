import { Survey } from '../types/survey.schema';
import { SurveyAnswer } from '../types/survey-answer';

class CreateUsersSurveysDto {
  openSurveys: string[];

  createdSurveys: Survey[];

  answeredSurveys: SurveyAnswer[];
}

export default CreateUsersSurveysDto;
