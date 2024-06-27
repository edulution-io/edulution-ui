import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToDeleteSurveyError = new HttpException(
  SurveyErrorMessages.NotAbleToDeleteSurveyError,
  HttpStatus.NOT_MODIFIED,
);

export default NotAbleToDeleteSurveyError;
