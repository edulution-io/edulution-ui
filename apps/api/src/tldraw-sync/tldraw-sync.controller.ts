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
import { Controller, Delete, Get, Param, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/apiEndpoints';
import APPS from '@libs/appconfig/constants/apps';
import { createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import FilesystemService from '../filesystem/filesystem.service';

@ApiTags(TLDRAW_SYNC_ENDPOINTS.BASE)
@ApiBearerAuth()
@Controller(TLDRAW_SYNC_ENDPOINTS.BASE)
class TldrawSyncController {
  constructor(private readonly filesystemService: FilesystemService) {}

  @Post(`${TLDRAW_SYNC_ENDPOINTS.ASSETS}/:name`)
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        () => `${APPS_FILES_PATH}/${APPS.WHITEBOARD}`,
        false,
        (_req, file) => file.originalname,
      ),
    ),
  )
  uploadFileToApp(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    return res.status(200).json(file.filename);
  }

  @Get(`${TLDRAW_SYNC_ENDPOINTS.ASSETS}/*filename`) serveFiles(
    @Param('filename') filename: string | string[],
    @Res() res: Response,
  ) {
    return this.filesystemService.serveFiles(APPS.WHITEBOARD, FilesystemService.buildPathString(filename), res);
  }

  @Delete(`${TLDRAW_SYNC_ENDPOINTS.ASSETS}/*filename`)
  deleteFile(@Param('filename') filename: string) {
    return FilesystemService.deleteFile(
      `${APPS_FILES_PATH}/${APPS.WHITEBOARD}`,
      FilesystemService.buildPathString(filename),
    );
  }
}

export default TldrawSyncController;
