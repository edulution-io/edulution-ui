import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToFindSurveyAnswerError = new HttpException(
  SurveyErrorMessages.NotAbleToFindSurveyAnswerError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveyAnswerError;
