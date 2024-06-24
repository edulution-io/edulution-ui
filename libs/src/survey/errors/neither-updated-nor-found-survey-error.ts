import { AxiosError } from 'axios';
import { HttpStatus } from '@nestjs/common';

const NeitherFoundNorCreatedSurveyError = new AxiosError(
  'Did not find the survey in order to update it. Neither could a new survey be created',
  `${ HttpStatus.INTERNAL_SERVER_ERROR }`,
);

export default NeitherFoundNorCreatedSurveyError;
