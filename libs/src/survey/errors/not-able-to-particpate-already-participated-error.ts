import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotAbleToParticpateAlreadyParticipatedError = new AxiosError(
  'User has already participated in the survey',
  `${ HttpStatus.FORBIDDEN }`,
);

export default NotAbleToParticpateAlreadyParticipatedError;
