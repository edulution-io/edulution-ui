import { HttpException, HttpStatus } from '@nestjs/common';

const NotAbleToFindSurveysError = new HttpException(
  'Did not find a single survey',
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindSurveysError;
