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

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { BulletinCategoryPermissionType } from '@libs/appconfig/types/bulletinCategoryPermissionType';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import BulletinCategoryService from './bulletin-category.service';
import AdminGuard from '../appconfig/admin.guard';

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
