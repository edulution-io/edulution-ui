// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from "@nestjs/common";
import SurveyErrors from "@libs/survey/survey-errors";

const NotAbleToFindSurveyAnswerError = new HttpException(
  // 'Survey answers not found',
  SurveyErrors.NotAbleToFindSurveyAnswerError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveyAnswerError;
