// TODO: Refactor errors when error handling is implemented

import { HttpException, HttpStatus } from "@nestjs/common";
import SurveyErrors from "@libs/survey/survey-errors";

const NotAbleToParticipateNotAnParticipantError = new HttpException(
  //'User is no participant of the survey',
  SurveyErrors.NotAbleToParticipateNotAnParticipantError,
  HttpStatus.UNAUTHORIZED,
);

export default NotAbleToParticipateNotAnParticipantError;
