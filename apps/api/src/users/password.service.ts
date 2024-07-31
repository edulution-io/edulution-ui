import { Model } from 'mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { getDecryptedPassword } from '@libs/common/utils';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import UserErrorMessages from '@libs/user/user-error-messages';
import { User, UserDocument } from './user.schema';

@Injectable()
class PasswordService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getPassword(user: JwtUser): Promise<string> {
    const { EDUI_ENCRYPTION_KEY } = process.env;

    if (!EDUI_ENCRYPTION_KEY) {
      throw new CustomHttpException(
        CommonErrorMessages.NotAbleToReadEnvironmentVariablesError,
        HttpStatus.FAILED_DEPENDENCY,
      );
    }

    const existingUser = await this.userModel.findOne({ username: user.preferred_username });
    if (!existingUser) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToGetUserError, HttpStatus.NOT_FOUND);
    }
    if (!existingUser.password) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToGetUserPasswordError, HttpStatus.NOT_FOUND);
    }

    let decryptedPassword = '';
    try {
      decryptedPassword = getDecryptedPassword(existingUser.password, EDUI_ENCRYPTION_KEY);
    } catch (error) {
      throw new CustomHttpException(UserErrorMessages.NotAbleToDecryptPasswordError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return decryptedPassword;
  }
}

export default PasswordService;
