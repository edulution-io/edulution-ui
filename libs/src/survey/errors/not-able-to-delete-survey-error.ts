import { HttpException, HttpStatus } from '@nestjs/common';

const NotAbleToDeleteSurveyError = new HttpException(
  'Not able to delete survey',
  HttpStatus.NOT_MODIFIED,
);

export default NotAbleToDeleteSurveyError;
