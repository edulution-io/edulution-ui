import { HttpException, HttpStatus } from '@nestjs/common';
import UserErrorMessages from '@libs/user/user-error-messages';

const NotAbleToUpdateUserError = new HttpException(
  UserErrorMessages.NotAbleToUpdateUserError,
  HttpStatus.INTERNAL_SERVER_ERROR,
);

export default NotAbleToUpdateUserError;
