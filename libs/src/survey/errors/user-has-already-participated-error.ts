import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const UserHasAlreadyParticipatedError = new AxiosError(
  'User has already participated in the survey',
  `${ HttpStatus.FORBIDDEN }`,
);

export default UserHasAlreadyParticipatedError;
