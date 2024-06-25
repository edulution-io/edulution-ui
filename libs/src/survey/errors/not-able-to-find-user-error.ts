// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotAbleToFindUserError = new HttpException(
  // 'User not found',
  SurveyErrors.NotAbleToFindUserError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindUserError;
