import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { BulletinCategoryPermissionType } from '@libs/appconfig/types/bulletinCategoryPermissionType';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import BulletinCategoryService from './bulletin-category.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

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
  @UseGuards(AppConfigGuard)
  create(@GetCurrentUser() currentUser: JWTUser, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.create(currentUser, bulletinCategory);
  }

  @Get(':name')
  @UseGuards(AppConfigGuard)
  async checkName(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.bulletinBoardService.checkIfNameExists(name);
  }

  @Patch(':id')
  @UseGuards(AppConfigGuard)
  update(@Param('id') id: string, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.update(id, bulletinCategory);
  }

  @Delete(':id')
  @UseGuards(AppConfigGuard)
  remove(@Param('id') id: string) {
    return this.bulletinBoardService.remove(id);
  }

  @Post('position')
  @UseGuards(AppConfigGuard)
  setPosition(@Body() { categoryId, position }: { categoryId: string; position: number }) {
    return this.bulletinBoardService.setPosition(categoryId, position);
  }
}

export default BulletinCategoryController;
