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

import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import WebdavShareDto from '@libs/filesharing/types/webdavShareDto';
import AppConfigGuard from '../../appconfig/appconfig.guard';
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
    } if (isRootServer === undefined) {
      const servers = await this.webdavSharesService.findAllWebdavServers();
      const shares = await this.webdavSharesService.findAllWebdavShares(currentUserGroups);
      return [...servers, ...shares];
    }

    return this.webdavSharesService.findAllWebdavShares(currentUserGroups);
  }

  @Post()
  @UseGuards(AppConfigGuard)
  createWebdavShare(@Body() webdavShareDto: WebdavShareDto) {
    return this.webdavSharesService.createWebdavShare(webdavShareDto);
  }

  @Put(':webdavShareId')
  @UseGuards(AppConfigGuard)
  async updateWebdavShare(@Param('webdavShareId') webdavShareId: string, @Body() webdavShareDto: WebdavShareDto) {
    return this.webdavSharesService.updateWebdavShare(webdavShareId, webdavShareDto);
  }

  @Delete(':webdavShareId')
  @UseGuards(AppConfigGuard)
  async deleteWebdavShare(@Param('webdavShareId') webdavShareId: string) {
    return this.webdavSharesService.deleteWebdavShare(webdavShareId);
  }
}

export default WebdavSharesController;
