import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotValidSurveyIdIsNoMongooseObjectId = new AxiosError(
  'The survey id must convertable into a valid mongo id',
  `${ HttpStatus.NOT_ACCEPTABLE }`,
);

export default NotValidSurveyIdIsNoMongooseObjectId;
