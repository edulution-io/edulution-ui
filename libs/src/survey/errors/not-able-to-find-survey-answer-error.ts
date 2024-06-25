import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotAbleToFindSurveyAnswerError = new AxiosError(
  'Survey answers not found',
  `${ HttpStatus.NOT_FOUND }`,
);

export default NotAbleToFindSurveyAnswerError;
