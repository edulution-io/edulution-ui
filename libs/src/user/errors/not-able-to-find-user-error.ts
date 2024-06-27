import { HttpException, HttpStatus } from '@nestjs/common';
import UserErrorMessages from '@libs/user/user-error-messages';

const NotAbleToFindUserError = new HttpException(
  UserErrorMessages.NotAbleToFindUserError,
  HttpStatus.NOT_FOUND,
);

export default NotAbleToFindUserError;
