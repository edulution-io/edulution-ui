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

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { BulletinCategoryPermissionType } from '@libs/appconfig/types/bulletinCategoryPermissionType';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import BulletinCategoryService from './bulletin-category.service';
import AdminGuard from '../common/guards/admin.guard';

@ApiTags('bulletin-category')
@ApiBearerAuth()
@Controller('bulletin-category')
class BulletinCategoryController {
  constructor(private readonly bulletinBoardService: BulletinCategoryService) {}

  @Get()
  findAll(@GetCurrentUser() currentUser: JWTUser, @Query('permission') permission: BulletinCategoryPermissionType) {
    return this.bulletinBoardService.findAll(currentUser, permission);
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@GetCurrentUser() currentUser: JWTUser, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.create(currentUser, bulletinCategory);
  }

  @Get(':name')
  @UseGuards(AdminGuard)
  async checkName(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.bulletinBoardService.checkIfNameExists(name);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.update(id, bulletinCategory);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.bulletinBoardService.remove(id);
  }

  @Post('position')
  @UseGuards(AdminGuard)
  setPosition(@Body() { categoryId, position }: { categoryId: string; position: number }) {
    return this.bulletinBoardService.setPosition(categoryId, position);
  }
}

export default BulletinCategoryController;
