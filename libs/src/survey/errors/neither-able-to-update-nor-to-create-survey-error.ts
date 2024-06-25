import {HttpException, HttpStatus} from '@nestjs/common';

const NeitherAbleToUpdateNorToCreateSurveyError = new HttpException(
  'Did not find the survey in order to update it. Neither could a new survey be created',
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NeitherAbleToUpdateNorToCreateSurveyError;
