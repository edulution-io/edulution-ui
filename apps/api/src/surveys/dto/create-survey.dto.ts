import { Attendee } from '../../conferences/dto/attendee';

class CreateSurveyDto {
  surveyname: string;

  participants: Attendee[];

  survey: string;

  anonymousAnswers?: string[];

  saveNo?: number;

  created?: Date;

  expires?: Date;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default CreateSurveyDto;
