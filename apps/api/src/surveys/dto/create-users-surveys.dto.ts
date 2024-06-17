import Survey from "@libs/survey/types/survey";
import SurveyAnswer from '@libs/survey/types/survey-answer';

class CreateUsersSurveysDto {
  openSurveys: string[];

  createdSurveys: Survey[];

  answeredSurveys: SurveyAnswer[];
}

export default CreateUsersSurveysDto;
