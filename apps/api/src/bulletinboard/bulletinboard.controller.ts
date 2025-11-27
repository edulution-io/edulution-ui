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

import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { Response } from 'express';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import APPS from '@libs/appconfig/constants/apps';
import BULLETIN_TEMP_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinTempAttachmentsPath';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { addUuidToFileName } from '@libs/common/utils/uuidAndFileNames';
import BulletinBoardService from './bulletinboard.service';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import GetToken from '../common/decorators/getToken.decorator';
import { checkAttachmentFile, createAttachmentUploadOptions } from '../filesystem/multer.utilities';

@ApiTags(APPS.BULLETIN_BOARD)
@ApiBearerAuth()
@Controller(APPS.BULLETIN_BOARD)
class BulletinBoardController {
  constructor(private readonly bulletinBoardService: BulletinBoardService) {}

  @Get()
  getBulletinsByCategory(@GetCurrentUser() currentUser: JWTUser, @GetToken() token: string) {
    return this.bulletinBoardService.getBulletinsByCategory(currentUser, token);
  }

  @Get('bulletins')
  findAllBulletins(@GetCurrentUser() currentUser: JWTUser, @GetToken() token: string) {
    return this.bulletinBoardService.findAllBulletins(currentUser, token);
  }

  @Post()
  createBulletin(@GetCurrentUser() currentUser: JWTUser, @Body() bulletin: CreateBulletinDto) {
    return this.bulletinBoardService.createBulletin(currentUser, bulletin);
  }

  @Patch(':id')
  updateBulletin(@GetCurrentUser() currentUser: JWTUser, @Param('id') id: string, @Body() bulletin: CreateBulletinDto) {
    return this.bulletinBoardService.updateBulletin(currentUser, id, bulletin);
  }

  @Delete()
  removeBulletins(@GetCurrentUser() currentUser: JWTUser, @Body() ids: string[]) {
    return this.bulletinBoardService.removeBulletins(currentUser, ids);
  }

  @Delete(':categoryId')
  removeAllBulletinsByCategory(@GetCurrentUser() currentUser: JWTUser, @Param('categoryId') categoryId: string) {
    return this.bulletinBoardService.removeAllBulletinsByCategory(currentUser, categoryId);
  }

  @Get('attachments/:filename')
  serveBulletinAttachment(@Param('filename') filename: string, @Res() res: Response) {
    return this.bulletinBoardService.serveBulletinAttachmentIfExists(filename, res);
  }

  @Post('files')
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        () => BULLETIN_TEMP_ATTACHMENTS_PATH,
        true,
        (_req, file) => addUuidToFileName(file.originalname, randomUUID()),
      ),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  uploadBulletinAttachment(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const fileName = checkAttachmentFile(file);
    return res.status(200).json(fileName);
  }
}

export default BulletinBoardController;
