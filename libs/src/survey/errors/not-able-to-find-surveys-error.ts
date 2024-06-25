// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from "@libs/survey/survey-errors";

const NotAbleToFindSurveysError = new HttpException(
  // 'Did not find a single survey',
  SurveyErrors.NotAbleToFindSurveysError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveysError;
