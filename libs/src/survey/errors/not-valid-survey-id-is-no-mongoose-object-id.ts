import { HttpException, HttpStatus } from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NotValidSurveyIdIsNoMongooseObjectId = new HttpException(
  SurveyErrorMessages.NotValidSurveyIdIsNoMongooseObjectId,
  HttpStatus.NOT_ACCEPTABLE,
);

export default NotValidSurveyIdIsNoMongooseObjectId;
