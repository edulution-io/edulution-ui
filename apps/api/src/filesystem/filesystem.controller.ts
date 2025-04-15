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
import { Controller, Delete, Get, Param, Post, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import { createAttachmentUploadOptions } from '../common/multer.utilities';
import AppConfigGuard from '../appconfig/appconfig.guard';
import FilesystemService from './filesystem.service';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
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
  uploadEmbeddedPageFiles(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    return res.status(200).json(file.filename);
  }

  @Get('info/:path(.*)')
  getFiles(@Param('path') path: string) {
    return this.filesystemService.getFilesInfo(path);
  }

  @Get('file/:name/:filename(.*)')
  serveFiles(@Param('name') name: string, @Param('filename') filename: string, @Res() res: Response) {
    return this.filesystemService.serveFiles(name, filename, res);
  }

  @Delete(':name/:filename')
  @UseGuards(AppConfigGuard)
  deleteFile(@Param('name') name: string, @Param('filename') filename: string) {
    return FilesystemService.deleteFile(`${APPS_FILES_PATH}/${name}`, filename);
  }
}

export default FileSystemController;
