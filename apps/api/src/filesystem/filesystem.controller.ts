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

/* eslint-disable @typescript-eslint/class-methods-use-this */
import { join } from 'path';
import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import EDU_API_CONFIG_ENDPOINTS from '@libs/appconfig/constants/appconfig-endpoints';
import FILE_ENDPOINTS from '@libs/filesystem/constants/endpoints';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import { createAttachmentUploadOptions } from './multer.utilities';
import CustomHttpException from '../common/CustomHttpException';
import AppConfigGuard from '../appconfig/appconfig.guard';
import FilesystemService from './filesystem.service';
import { Public } from '../common/decorators/public.decorator';
import IsPublicAppGuard from '../common/guards/isPublicApp.guard';

@ApiTags(EDU_API_CONFIG_ENDPOINTS.FILES)
@ApiBearerAuth()
@Controller(EDU_API_CONFIG_ENDPOINTS.FILES)
class FileSystemController {
  constructor(private readonly filesystemService: FilesystemService) {}

  @Post(':name')
  @UseGuards(AppConfigGuard)
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

  @Delete(':appName/*filename')
  @UseGuards(AppConfigGuard)
  deleteFile(@Param('appName') appName: string, @Param('filename') filename: string) {
    const appsPath = join(APPS_FILES_PATH, appName);
    return FilesystemService.deleteFile(appsPath, FilesystemService.buildPathString(filename));
  }
}

export default FileSystemController;
