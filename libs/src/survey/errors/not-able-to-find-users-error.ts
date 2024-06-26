// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotAbleToFindUsersError = new HttpException(
  // 'User not found',
  SurveyErrors.NotAbleToFindUsersError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindUsersError;
