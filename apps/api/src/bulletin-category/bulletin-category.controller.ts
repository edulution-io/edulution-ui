import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { BulletinCategoryPermissionType } from '@libs/appconfig/types/bulletinCategoryPermissionType';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import BulletinCategoryService from './bulletin-category.service';

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
  create(@GetCurrentUser() currentUser: JWTUser, @Body() bulletinCategory: CreateBulletinCategoryDto) {
    return this.bulletinBoardService.create(currentUser, bulletinCategory);
  }

  @Get(':name')
  async checkName(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.bulletinBoardService.checkIfNameExists(name);
  }

  @Patch(':id')
  update(
    @GetCurrentUser() currentUser: JWTUser,
    @Param('id') id: string,
    @Body() bulletinCategory: CreateBulletinCategoryDto,
  ) {
    return this.bulletinBoardService.update(currentUser, id, bulletinCategory);
  }

  @Delete(':id')
  remove(@GetCurrentUser() currentUser: JWTUser, @Param('id') id: string) {
    return this.bulletinBoardService.remove(currentUser, id);
  }

  @Post('position')
  setPosition(
    @GetCurrentUser() currentUser: JWTUser,
    @Body() { categoryId, position }: { categoryId: string; position: number },
  ) {
    return this.bulletinBoardService.setPosition(currentUser, categoryId, position);
  }
}

export default BulletinCategoryController;
