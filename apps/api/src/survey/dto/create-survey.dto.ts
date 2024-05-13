class CreateSurveyDto {
  surveyname: string;

  participants: string[];

  survey: JSON;

  isAnonymous: boolean;

  isAnswerChangeable: boolean;
}

export default CreateSurveyDto;
