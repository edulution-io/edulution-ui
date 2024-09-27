import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { Request } from 'express';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import CustomFile from '@libs/filesharing/types/customFile';
import { JwtService } from '@nestjs/jwt';
import { AppExtendedOptions } from '@libs/appconfig/constants/appExtendedType';
import AppConfigService from '../appconfig/appconfig.service';
import JWTUser from '../types/JWTUser';
import TokenService from '../common/services/token.service';
import FilesystemService from './filesystem.service';

@Injectable()
class OnlyofficeService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly tokenService: TokenService,
    private jwtService: JwtService,
  ) {}

  async generateOnlyOfficeToken(payload: string): Promise<string> {
    const appConfig = await this.appConfigService.getAppConfigByName('filesharing');
    const jwtSecret = appConfig?.extendedOptions.find(
      (option) => option.name === AppExtendedOptions.ONLY_OFFICE_JWT_SECRET,
    );
    if (!jwtSecret) {
      throw new CustomHttpException(FileSharingErrorMessage.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const secret = jwtSecret.value;
    return this.jwtService.sign(payload, { secret });
  }

  async handleCallback(
    req: Request,
    path: string,
    filename: string,
    eduToken: string,
    uploadFile: (username: string, path: string, file: CustomFile, name: string) => Promise<WebdavStatusReplay>,
  ) {
    const callbackData = req.body as OnlyOfficeCallbackData;
    const cleanedPath = getPathWithoutWebdav(path);

    let user: JWTUser;
    try {
      await this.tokenService.isTokenValid(eduToken);
      user = await this.tokenService.getCurrentUser(eduToken);
    } catch (error) {
      throw new CustomHttpException(FileSharingErrorMessage.UploadFailed, HttpStatus.UNAUTHORIZED);
    }

    if (!user) {
      throw new CustomHttpException(FileSharingErrorMessage.UploadFailed, HttpStatus.FORBIDDEN);
    }

    if (callbackData.status === 2 || callbackData.status === 4) {
      const file = await FilesystemService.retrieveAndSaveFile(filename, callbackData);
      if (file) {
        await uploadFile(user.preferred_username, cleanedPath, file, '');
      } else {
        throw new CustomHttpException(FileSharingErrorMessage.FileNotFound, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default OnlyofficeService;
