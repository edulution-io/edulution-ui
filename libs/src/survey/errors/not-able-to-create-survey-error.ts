// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotAbleToCreateSurveyError = new HttpException(
  // 'Not able to create the survey',
  SurveyErrors.NotAbleToCreateSurveyError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NotAbleToCreateSurveyError;
