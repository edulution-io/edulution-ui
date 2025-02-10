/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import CustomHttpException from '@libs/error/CustomHttpException';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { Request, Response } from 'express';
import { WebdavStatusReplay } from '@libs/filesharing/types/fileOperationResult';
import CustomFile from '@libs/filesharing/types/customFile';
import { JwtService } from '@nestjs/jwt';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import AppConfigService from '../appconfig/appconfig.service';
import FilesystemService from '../filesystem/filesystem.service';

const { EDULUTION_ONLYOFFICE_JWT_SECRET } = process.env;

@Injectable()
class OnlyofficeService implements OnModuleInit {
  constructor(
    private readonly appConfigService: AppConfigService,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.FILE_SHARING);

    if (
      EDULUTION_ONLYOFFICE_JWT_SECRET &&
      appConfig.extendedOptions &&
      Object.keys(appConfig.extendedOptions).length === 0
    ) {
      const patchConfigDto: PatchConfigDto = {
        field: 'extendedOptions',
        value: {
          [ExtendedOptionKeys.ONLY_OFFICE_URL]: '',
          [ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]: EDULUTION_ONLYOFFICE_JWT_SECRET,
          [ExtendedOptionKeys.OVERRIDE_FILE_SHARING_DOCUMENT_VENDOR_MS_WITH_OO]: false,
        },
      };

      await this.appConfigService.patchConfig(APPS.FILE_SHARING, patchConfigDto, []);
    }
  }

  async generateOnlyOfficeToken(payload: string): Promise<string> {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.FILE_SHARING);
    if (!appConfig.extendedOptions || !appConfig.extendedOptions[ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]) {
      throw new CustomHttpException(FileSharingErrorMessage.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    const jwtSecret = appConfig?.extendedOptions[ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET] as string;
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
    const uniqueFileName = `${uuidv4()}-${filename}`;

    try {
      if (callbackData.status === 2 || callbackData.status === 4) {
        const file = await FilesystemService.retrieveAndSaveFile(uniqueFileName, callbackData);
        if (file) {
          await uploadFile(username, cleanedPath, file, '');
          await FilesystemService.deleteFile(uniqueFileName);
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
