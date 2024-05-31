import { Attendee } from '../../conferences/dto/attendee';

class CreateSurveyDto {
  surveyname: string;

  participants: Attendee[];

  survey: string;

  anonymousAnswers?: string[];

  saveNo?: number;

  created?: Date;

  isAnonymous?: boolean;

  isAnswerChangeable?: boolean;

  // canSubmitMultipleTimes?: boolean;
}

export default CreateSurveyDto;
