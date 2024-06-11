import { Attendee } from '../../conferences/dto/attendee.ts';

class CreateSurveyDto {
  id: number;

  formula: JSON;

  participants: Attendee[];

  participated?: string[];

  publicAnswers?: JSON[];

  saveNo?: number;

  created?: Date;

  expirationDate?: Date;

  expirationTime?: string;

  isAnonymous?: boolean;

  canSubmitMultipleAnswers?: boolean;
}

export default CreateSurveyDto;
