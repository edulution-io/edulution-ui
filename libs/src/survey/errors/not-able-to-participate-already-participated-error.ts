// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotAbleToParticipateAlreadyParticipatedError = new HttpException(
  // 'User has already participated in the survey',
  SurveyErrors.NotAbleToParticipateAlreadyParticipatedError,
  HttpStatus.FORBIDDEN,
);

export default NotAbleToParticipateAlreadyParticipatedError;
