import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';

const NotAbleToUpdateSurveyError = new AxiosError(
  'Not able to update the survey',
  `${ HttpStatus.INTERNAL_SERVER_ERROR }`,
);

export default NotAbleToUpdateSurveyError;
