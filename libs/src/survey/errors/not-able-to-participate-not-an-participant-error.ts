import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToParticipateNotAnParticipantError = new HttpException(
  SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError,
  HttpStatus.UNAUTHORIZED,
);

export default NotAbleToParticipateNotAnParticipantError;
