import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';

const NotAbleToFindSurveysError = new AxiosError(
  'Did not find a single survey',
  `${ HttpStatus.NOT_FOUND }`,
);

export default NotAbleToFindSurveysError;
