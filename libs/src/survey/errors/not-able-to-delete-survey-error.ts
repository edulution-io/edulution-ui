// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from "@libs/survey/survey-errors";

const NotAbleToDeleteSurveyError = new HttpException(
  // 'Not able to delete survey',
  SurveyErrors.NotAbleToDeleteSurveyError,
  HttpStatus.NOT_MODIFIED,
);

export default NotAbleToDeleteSurveyError;
