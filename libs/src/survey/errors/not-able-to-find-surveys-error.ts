import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToFindSurveysError = new HttpException(
  SurveyErrorMessages.NotAbleToFindSurveysError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveysError;
