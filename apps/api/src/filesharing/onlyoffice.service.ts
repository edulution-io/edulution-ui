/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import { Request, Response } from 'express';
import { WebdavStatusResponse } from '@libs/filesharing/types/fileOperationResult';
import CustomFile from '@libs/filesharing/types/customFile';
import { JwtService } from '@nestjs/jwt';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import APPS from '@libs/appconfig/constants/apps';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import CustomHttpException from '../common/CustomHttpException';
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

    if (!appConfig) return;

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

      await this.appConfigService.patchSingleFieldInConfig(APPS.FILE_SHARING, patchConfigDto, []);
    }
  }

  async generateOnlyOfficeToken(payload: string): Promise<string> {
    const appConfig = await this.appConfigService.getAppConfigByName(APPS.FILE_SHARING);
    if (!appConfig?.extendedOptions || !appConfig.extendedOptions[ExtendedOptionKeys.ONLY_OFFICE_JWT_SECRET]) {
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
    uploadFile: (username: string, path: string, file: CustomFile, name: string) => Promise<WebdavStatusResponse>,
  ) {
    const callbackData = req.body as OnlyOfficeCallbackData;
    const uniqueFileName = `${randomUUID()}-${filename}`;

    if (callbackData.status !== 2 && callbackData.status !== 4) {
      return res.status(HttpStatus.OK).json({ error: 0 });
    }

    const file = await FilesystemService.retrieveAndSaveFile(uniqueFileName, callbackData.url);

    if (!file) {
      return res.status(HttpStatus.NOT_FOUND).json({ error: 1 });
    }

    await uploadFile(username, path, file, '');
    await FilesystemService.deleteFile(PUBLIC_DOWNLOADS_PATH, uniqueFileName);

    return res.status(HttpStatus.OK).json({ error: 0 });
  }
}

export default OnlyofficeService;
