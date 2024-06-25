import { HttpException, HttpStatus } from "@nestjs/common";

const NotAbleToParticipateNotAnParticipantError = new HttpException(
  'User is no participant of the survey',
  HttpStatus.UNAUTHORIZED,
);

export default NotAbleToParticipateNotAnParticipantError;
