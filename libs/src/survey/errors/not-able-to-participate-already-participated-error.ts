import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToParticipateAlreadyParticipatedError = new HttpException(
  SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError,
  HttpStatus.FORBIDDEN,
);

export default NotAbleToParticipateAlreadyParticipatedError;
