import { HttpException, HttpStatus } from '@nestjs/common';

const NotAbleToUpdateSurveyError = new HttpException(
  'Not able to update the survey',
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NotAbleToUpdateSurveyError;
