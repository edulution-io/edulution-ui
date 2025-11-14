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

/* eslint-disable @typescript-eslint/class-methods-use-this */
import { join } from 'path';
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import FILE_ENDPOINTS from '@libs/filesystem/constants/endpoints';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import PUBLIC_ASSET_PATH from '@libs/common/constants/publicAssetPath';
import { ThemeType } from '@libs/common/constants/theme';
import { UploadGlobalAssetDto } from '@libs/filesystem/types/uploadGlobalAssetDto';
import CustomHttpException from '../common/CustomHttpException';
import { createAttachmentUploadOptions, createDiskStorage } from './multer.utilities';
import AdminGuard from '../common/guards/admin.guard';
import FilesystemService from './filesystem.service';
import { Public } from '../common/decorators/public.decorator';
import IsPublicAppGuard from '../common/guards/isPublicApp.guard';

@ApiTags(EDU_API_CONFIG_ENDPOINTS.FILES)
@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINTS.FILES)
class FileSystemController {
  constructor(private readonly filesystemService: FilesystemService) {}

  @Post(':name')
  @UseGuards(AdminGuard)
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        (req) => `${APPS_FILES_PATH}/${req.params.name}`,
        false,
        (_req, file) => file.originalname,
      ),
    ),
  )
  uploadFileToApp(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    if (!file) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
    }
    return res.status(200).json(file.filename);
  }

  @Get('info/*path')
  getFiles(@Param('path') path: string | string[]) {
    return this.filesystemService.getFilesInfo(FilesystemService.buildPathString(path));
  }

  @Public()
  @UseGuards(IsPublicAppGuard)
  @Get('public/logo/:appName/:variant')
  serveAppLogo(@Param('appName') appName: string, @Param('variant') variant: ThemeType, @Res() res: Response) {
    return this.filesystemService.serveAppLogo(appName, variant, res);
  }

  @Get(`${FILE_ENDPOINTS.FILE}/:appName/*filename`)
  serveFiles(@Param('appName') appName: string, @Param('filename') filename: string | string[], @Res() res: Response) {
    return this.filesystemService.serveFiles(appName, FilesystemService.buildPathString(filename), res);
  }

  @Public()
  @UseGuards(IsPublicAppGuard)
  @Get('public/info/:appName')
  getPublicFilesInfo(@Param('appName') appName: string) {
    return this.filesystemService.getFilesInfo(FilesystemService.buildPathString(appName));
  }

  @Public()
  @UseGuards(IsPublicAppGuard)
  @Get(`public/${FILE_ENDPOINTS.FILE}/:appName/*filename`)
  servePublicFiles(
    @Param('appName') appName: string,
    @Param('filename') filename: string | string[],
    @Res() res: Response,
  ) {
    return this.filesystemService.serveFiles(appName, FilesystemService.buildPathString(filename), res);
  }

  @Delete('public/:appName/*filename')
  @UseGuards(AdminGuard)
  deletePublicFile(@Param('appName') appName: string, @Param('filename') filename: string) {
    const appsPath = join(PUBLIC_ASSET_PATH, appName);
    return FilesystemService.deleteFile(appsPath, FilesystemService.buildPathString(filename));
  }

  @Delete(':appName/*filename')
  @UseGuards(AdminGuard)
  deleteFile(@Param('appName') appName: string, @Param('filename') filename: string) {
    const appsPath = join(APPS_FILES_PATH, appName);
    return FilesystemService.deleteFile(appsPath, FilesystemService.buildPathString(filename));
  }

  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: createDiskStorage(
        (request) => {
          const { body } = request as { body?: UploadGlobalAssetDto };
          if (!body?.destination) {
            throw new CustomHttpException(CommonErrorMessages.FILE_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
          }
          return join(PUBLIC_ASSET_PATH, body.destination);
        },
        (request) => {
          const { body } = request as { body?: UploadGlobalAssetDto };
          if (!body?.filename) {
            throw new CustomHttpException(CommonErrorMessages.FILE_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
          }
          return body.filename;
        },
      ),
    }),
  )
  upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
    }
    return { path: `${file.destination.replace('.', '')}/${file.filename}` };
  }
}

export default FileSystemController;
