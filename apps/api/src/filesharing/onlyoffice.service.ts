import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { Request, Response } from 'express';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import CustomFile from '@libs/filesharing/types/customFile';
import { JwtService } from '@nestjs/jwt';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import AppConfigService from '../appconfig/appconfig.service';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class OnlyofficeService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private jwtService: JwtService,
  ) {}

  async generateOnlyOfficeToken(payload: string): Promise<string> {
    const appConfig = await this.appConfigService.getAppConfigByName('filesharing');
    const jwtSecret = appConfig?.extendedOptions[ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET];
    if (!jwtSecret) {
      throw new CustomHttpException(FileSharingErrorMessage.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return this.jwtService.sign(payload, { secret: jwtSecret });
  }

  static async handleCallback(
    req: Request,
    res: Response,
    path: string,
    filename: string,
    username: string,
    uploadFile: (username: string, path: string, file: CustomFile, name: string) => Promise<WebdavStatusReplay>,
  ) {
    const callbackData = req.body as OnlyOfficeCallbackData;
    const cleanedPath = getPathWithoutWebdav(path);

    try {
      if (callbackData.status === 2 || callbackData.status === 4) {
        const file = await FilesystemService.retrieveAndSaveFile(filename, callbackData);
        if (file) {
          await uploadFile(username, cleanedPath, file, '');
          return res.status(HttpStatus.OK).json({ error: 0 });
        }
        throw new CustomHttpException(FileSharingErrorMessage.FileNotFound, HttpStatus.NOT_FOUND);
      } else {
        return res.status(HttpStatus.OK).json({ error: 0 });
      }
    } catch (error) {
      Logger.error('Error handling OnlyOffice callback', OnlyofficeService.name);
      return res.status(HttpStatus.NOT_FOUND).json({ error: 1 });
    }
  }
}

export default OnlyofficeService;
