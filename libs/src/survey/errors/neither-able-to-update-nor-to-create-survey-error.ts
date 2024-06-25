// TODO: Refactor errors when error handling is implemented

import {HttpException, HttpStatus} from '@nestjs/common';
import SurveyErrors from '@libs/survey/survey-errors';

const NeitherAbleToUpdateNorToCreateSurveyError = new HttpException(
  // 'Did not find the survey in order to update it. Neither could a new survey be created',
  SurveyErrors.NeitherAbleToUpdateNorToCreateSurveyError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NeitherAbleToUpdateNorToCreateSurveyError;
