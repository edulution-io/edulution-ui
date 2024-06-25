import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotAbleToParticpateNotAnParticipantError = new AxiosError(
  'User is no participant of the survey',
  `${ HttpStatus.UNAUTHORIZED }`,
);

export default NotAbleToParticpateNotAnParticipantError;
