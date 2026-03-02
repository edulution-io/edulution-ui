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

import { Controller, Get, Post, Param, Query, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import Public from '../common/decorators/public.decorator';
import CollaboraService from './collabora.service';
import WebdavService from '../webdav/webdav.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';
import FilesystemService from '../filesystem/filesystem.service';

const WOPI_BASE_PATH = 'wopi/files';

@Controller(WOPI_BASE_PATH)
class WopiController {
  constructor(
    private readonly collaboraService: CollaboraService,
    private readonly webdavService: WebdavService,
    private readonly webdavSharesService: WebdavSharesService,
  ) {}

  @Public()
  @Get(':fileId')
  async checkFileInfo(
    @Param('fileId') fileId: string,
    @Query('access_token') accessToken: string,
    @Res() res: Response,
  ) {
    Logger.log(`CheckFileInfo for fileId=${fileId}`, WopiController.name);
    const tokenData = await this.collaboraService.validateWopiToken(accessToken);
    const fileName = tokenData.filePath.split('/').pop() || fileId;

    const fileInfo = {
      BaseFileName: fileName,
      Size: 0,
      OwnerId: tokenData.username,
      UserId: tokenData.username,
      UserFriendlyName: tokenData.username,
      UserCanWrite: tokenData.canWrite,
      UserCanNotWriteRelative: true,
      PostMessageOrigin: '*',
      LastModifiedTime: new Date().toISOString(),
      Version: Date.now().toString(),
    };

    return res.status(HttpStatus.OK).json(fileInfo);
  }

  @Public()
  @Get(':fileId/contents')
  async getFile(@Param('fileId') _fileId: string, @Query('access_token') accessToken: string, @Res() res: Response) {
    const tokenData = await this.collaboraService.validateWopiToken(accessToken);
    const client = await this.webdavService.getClient(tokenData.username, tokenData.share);
    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(tokenData.share);
    const pathWithoutWebdav = getPathWithoutWebdav(tokenData.filePath, webdavShare.pathname);
    const url = WebdavService.safeJoinUrl(webdavShare.url, pathWithoutWebdav);

    const stream = await FilesystemService.fetchFileStream(url, client);
    const readableStream = stream instanceof Readable ? stream : stream.data;

    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_OCTET_STREAM);

    try {
      await pipeline(readableStream, res);
    } catch {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).end();
      }
    }
  }

  @Public()
  @Post(':fileId/contents')
  async putFile(
    @Param('fileId') fileId: string,
    @Query('access_token') accessToken: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    Logger.log(`PutFile for fileId=${fileId}`, WopiController.name);
    const tokenData = await this.collaboraService.validateWopiToken(accessToken);

    if (!tokenData.canWrite) {
      return res.status(HttpStatus.FORBIDDEN).json({ error: 'Read-only access' });
    }

    const webdavShare = await this.webdavSharesService.getWebdavShareFromCache(tokenData.share);
    const pathWithoutWebdav = getPathWithoutWebdav(tokenData.filePath, webdavShare.pathname);

    const contentType =
      (req.headers[HTTP_HEADERS.ContentType] as string) || RequestResponseContentType.APPLICATION_OCTET_STREAM;

    await this.webdavService.uploadFile(tokenData.username, pathWithoutWebdav, req, tokenData.share, contentType);

    return res.status(HttpStatus.OK).json({
      LastModifiedTime: new Date().toISOString(),
    });
  }
}

export default WopiController;
