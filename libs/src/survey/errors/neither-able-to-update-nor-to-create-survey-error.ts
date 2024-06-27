import {HttpException, HttpStatus} from '@nestjs/common';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';

const NeitherAbleToUpdateNorToCreateSurveyError = new HttpException(
  SurveyErrorMessages.NeitherAbleToUpdateNorToCreateSurveyError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NeitherAbleToUpdateNorToCreateSurveyError;
