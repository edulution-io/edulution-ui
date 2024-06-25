import { HttpException, HttpStatus } from "@nestjs/common";

const NotAbleToParticipateAlreadyParticipatedError = new HttpException(
  'User has already participated in the survey',
  HttpStatus.FORBIDDEN,
);

export default NotAbleToParticipateAlreadyParticipatedError;
