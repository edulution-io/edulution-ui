import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const SurveyNotFoundError = new AxiosError(
  'Survey not found',
  `${ HttpStatus.NOT_FOUND }`,
);

export default SurveyNotFoundError;
