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
import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type Response } from 'express';
import { ApiBearerAuth, ApiConsumes, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import TLDRAW_SYNC_ENDPOINTS from '@libs/tldraw-sync/constants/tLDrawSyncEndpoints';
import APPS from '@libs/appconfig/constants/apps';
import HistoryPageDto from '@libs/whiteboard/types/historyPageDto';
import TLDRAW_MULTI_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawMultiUserRoomPrefix';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import { SkipPayloadFilter } from 'apps/api/src/common/decorators/skip-payload-filter.decorator';
import { createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import FilesystemService from '../filesystem/filesystem.service';
import TLDrawSyncService from './tldraw-sync.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import CustomHttpException from '../common/CustomHttpException';

@ApiTags(TLDRAW_SYNC_ENDPOINTS.BASE)
@ApiBearerAuth()
@Controller(TLDRAW_SYNC_ENDPOINTS.BASE)
class TLDrawSyncController {
  constructor(
    private readonly filesystemService: FilesystemService,
    private readonly tldrawSyncService: TLDrawSyncService,
  ) {}

  @Post(`${TLDRAW_SYNC_ENDPOINTS.ASSETS}/:name`)
  @SkipPayloadFilter()
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
    if (!file) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
    }
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

  @Get(`${TLDRAW_SYNC_ENDPOINTS.HISTORY}/:${ROOM_ID_PARAM}`)
  @ApiOkResponse({ type: HistoryPageDto })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async getHistory(
    @Param(ROOM_ID_PARAM) roomId: string,
    @GetCurrentUsername() username: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const p = Math.max(1, parseInt(page, 10));
    const l = Math.min(50, Math.max(1, parseInt(limit, 10)));
    return this.tldrawSyncService.getHistory(TLDRAW_MULTI_USER_ROOM_PREFIX + roomId, p, l, username);
  }
}

export default TLDrawSyncController;
