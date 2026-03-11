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

import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import APPS from '@libs/appconfig/constants/apps';
import WIKI_ENDPOINTS from '@libs/wiki/constants/wikiEndpoints';
import type CreateWikiDto from '@libs/wiki/types/createWikiDto';
import type CreateWikiPageDto from '@libs/wiki/types/createWikiPageDto';
import type UpdateWikiPageDto from '@libs/wiki/types/updateWikiPageDto';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';
import RequireAppAccess from '../common/decorators/requireAppAccess.decorator';
import WikiService from './wiki.service';

@ApiTags(WIKI_ENDPOINTS.BASE)
@ApiBearerAuth()
@RequireAppAccess(APPS.WIKI)
@Controller(WIKI_ENDPOINTS.BASE)
class WikiController {
  constructor(private readonly wikiService: WikiService) {}

  @Get(WIKI_ENDPOINTS.REGISTRATIONS)
  async getRegistrations(@GetCurrentUserGroups() userGroups: string[]) {
    return this.wikiService.getAccessibleRegistrations(userGroups);
  }

  @Post(WIKI_ENDPOINTS.REGISTRATIONS)
  async createWiki(@Body() dto: CreateWikiDto, @GetCurrentUsername() username: string) {
    return this.wikiService.createWiki(dto, username);
  }

  @Put(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id`)
  async updateWiki(@Param('id') id: string, @Body('name') name: string, @GetCurrentUserGroups() userGroups: string[]) {
    return this.wikiService.updateWiki(id, name, userGroups);
  }

  @Delete(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id`)
  async deleteWiki(
    @Param('id') id: string,
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() userGroups: string[],
  ) {
    return this.wikiService.deleteWiki(id, username, userGroups);
  }

  @Get(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id/${WIKI_ENDPOINTS.PAGES}`)
  async getPages(
    @Param('id') id: string,
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() userGroups: string[],
  ) {
    return this.wikiService.getPages(id, username, userGroups);
  }

  @Post(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id/${WIKI_ENDPOINTS.PAGES}`)
  async createPage(
    @Param('id') id: string,
    @Body() dto: CreateWikiPageDto,
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() userGroups: string[],
  ) {
    return this.wikiService.createPage(id, dto, username, userGroups);
  }

  @Get(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id/${WIKI_ENDPOINTS.PAGES}/${WIKI_ENDPOINTS.CONTENT}`)
  async getPageContent(
    @Param('id') id: string,
    @Query('path') relativePath: string,
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() userGroups: string[],
  ) {
    return this.wikiService.getPageContent(id, relativePath, username, userGroups);
  }

  @Put(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id/${WIKI_ENDPOINTS.PAGES}`)
  async updatePage(
    @Param('id') id: string,
    @Query('path') relativePath: string,
    @Body() dto: UpdateWikiPageDto,
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() userGroups: string[],
  ) {
    return this.wikiService.updatePage(id, relativePath, dto, username, userGroups);
  }

  @Delete(`${WIKI_ENDPOINTS.REGISTRATIONS}/:id/${WIKI_ENDPOINTS.PAGES}`)
  async deletePage(
    @Param('id') id: string,
    @Query('path') relativePath: string,
    @GetCurrentUsername() username: string,
    @GetCurrentUserGroups() userGroups: string[],
  ) {
    return this.wikiService.deletePage(id, relativePath, username, userGroups);
  }
}

export default WikiController;
