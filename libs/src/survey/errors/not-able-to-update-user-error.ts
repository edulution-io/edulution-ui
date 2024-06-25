// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotAbleToUpdateUserError = new HttpException(
  // 'Not able to update the user',
  SurveyErrors.NotAbleToUpdateUserError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NotAbleToUpdateUserError;
