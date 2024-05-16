import SurveyType from '../types/survey-type.enum';

class CreateSurveyDto {
  surveyname: string;

  type: SurveyType;

  participants: string[];

  survey: JSON;

  isAnonymous: boolean;

  isAnswerChangeable: boolean;
}

export default CreateSurveyDto;
