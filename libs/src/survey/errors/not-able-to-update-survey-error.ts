import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotAbleToUpdateSurveyError = new HttpException(
  SurveyErrorMessages.NotAbleToUpdateSurveyError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NotAbleToUpdateSurveyError;
