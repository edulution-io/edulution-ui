import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotAbleToUpdateUserError = new AxiosError(
  'Not able to update the user',
  `${ HttpStatus.INTERNAL_SERVER_ERROR }`,
);

export default NotAbleToUpdateUserError;
