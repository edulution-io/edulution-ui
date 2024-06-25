// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NotValidSurveyIdIsNoMongooseObjectId = new HttpException(
  // 'The survey id must convertable into a valid mongo id',
  SurveyErrors.NotValidSurveyIdIsNoMongooseObjectId,
  HttpStatus.NOT_ACCEPTABLE,
);

export default NotValidSurveyIdIsNoMongooseObjectId;
