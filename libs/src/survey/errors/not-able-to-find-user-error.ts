import { AxiosError } from 'axios';
import { HttpStatus } from "@nestjs/common";

const NotAbleToFindUserError = new AxiosError(
  'User not found',
  `${ HttpStatus.NOT_FOUND }`,
);

export default NotAbleToFindUserError;
