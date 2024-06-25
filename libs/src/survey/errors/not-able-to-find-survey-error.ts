import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotAbleToFindSurveyError = new AxiosError(
  'Survey not found',
  `${ HttpStatus.NOT_FOUND }`,
);

export default NotAbleToFindSurveyError;
