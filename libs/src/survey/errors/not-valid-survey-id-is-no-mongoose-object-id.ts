import { HttpException, HttpStatus } from '@nestjs/common';

const NotValidSurveyIdIsNoMongooseObjectId = new HttpException(
  'The survey id must convertable into a valid mongo id',
  HttpStatus.NOT_ACCEPTABLE,
);

export default NotValidSurveyIdIsNoMongooseObjectId;
