// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from "@libs/survey/survey-errors";

const NotAbleToFindSurveyError = new HttpException(
  // 'Survey not found',
  SurveyErrors.NotAbleToFindSurveyError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveyError;
