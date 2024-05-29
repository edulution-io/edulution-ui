import { Attendee } from '../../../conferences/dto/attendee';

class CreateSurveyDto {
  surveyname: string;

  participants: Attendee[];

  survey: string;

  saveNo?: number;

  created?: Date;

  isAnonymous: boolean;

  isAnswerChangeable: boolean;
}

export default CreateSurveyDto;
