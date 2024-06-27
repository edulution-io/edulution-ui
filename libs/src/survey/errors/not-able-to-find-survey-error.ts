import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToFindSurveyError = new HttpException(
  SurveyErrorMessages.NotAbleToFindSurveyError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveyError;
