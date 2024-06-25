// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotAbleToUpdateSurveyError = new HttpException(
  // 'Not able to update the survey',
  SurveyErrors.NotAbleToUpdateSurveyError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NotAbleToUpdateSurveyError;
