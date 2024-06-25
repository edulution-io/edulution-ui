import { HttpException, HttpStatus } from '@nestjs/common';

const NotAbleToFindSurveyError = new HttpException(
  'Survey not found',
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveyError;
