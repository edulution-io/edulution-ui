import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import BulletinCategoryService from './bulletin-category.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

@ApiTags('bulletin-category')
@ApiBearerAuth()
@Controller('bulletin-category')
class BulletinCategoryController {
  constructor(private readonly bulletinBoardService: BulletinCategoryService) {}

  @Get()
  findAll(@GetCurrentUser() currentUser: JWTUser) {
    return this.bulletinBoardService.findAll(currentUser);
  }

  @Post()
  create(@GetCurrentUser() currentUser: JWTUser, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.create(currentUser, bulletinCategory);
  }

  @Get(':name')
  @UseGuards(AppConfigGuard)
  getConfigByName(@Param('name') name: string) {
    return this.bulletinBoardService.getConfigByName(name);
  }

  @Post(':name')
  async checkName(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.bulletinBoardService.checkIfNameExists(name);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.update(id, bulletinCategory);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bulletinBoardService.remove(id);
  }
}

export default BulletinCategoryController;
