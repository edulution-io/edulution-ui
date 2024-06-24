import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';

const NotAbleToDeleteSurveyError = new AxiosError(
  'Not able to delete survey',
  `${ HttpStatus.NOT_MODIFIED }`,
);

export default NotAbleToDeleteSurveyError;
