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

import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import AdminGuard from '../../common/guards/admin.guard';
import WebdavSharesService from './webdav-shares.service';
import GetCurrentUserGroups from '../../common/decorators/getCurrentUserGroups.decorator';

@ApiTags('webdav-shares')
@ApiBearerAuth()
@Controller('webdav-shares')
class WebdavSharesController {
  constructor(private readonly webdavSharesService: WebdavSharesService) {}

  @Get()
  async findAllShares(
    @Query('isRootServer', new ParseBoolPipe({ optional: true })) isRootServer: boolean | undefined,
    @GetCurrentUserGroups() currentUserGroups: string[],
  ) {
    if (isRootServer) {
      return this.webdavSharesService.findAllWebdavServers();
    }
    if (isRootServer === undefined) {
      const servers = await this.webdavSharesService.findAllWebdavServers();
      const shares = await this.webdavSharesService.findAllWebdavShares(currentUserGroups);
      return [...servers, ...shares];
    }

    return this.webdavSharesService.findAllWebdavShares(currentUserGroups);
  }

  @Post()
  @UseGuards(AdminGuard)
  createWebdavShare(@Body() webdavShareDto: WebdavShareDto) {
    return this.webdavSharesService.createWebdavShare(webdavShareDto);
  }

  @Put(':webdavShareId')
  @UseGuards(AdminGuard)
  async updateWebdavShare(@Param('webdavShareId') webdavShareId: string, @Body() webdavShareDto: WebdavShareDto) {
    return this.webdavSharesService.updateWebdavShare(webdavShareId, webdavShareDto);
  }

  @Delete(':webdavShareId')
  @UseGuards(AdminGuard)
  async deleteWebdavShare(@Param('webdavShareId') webdavShareId: string) {
    return this.webdavSharesService.deleteWebdavShare(webdavShareId);
  }
}

export default WebdavSharesController;
