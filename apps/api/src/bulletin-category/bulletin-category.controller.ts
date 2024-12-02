import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import { BulletinCategoryService } from './bulletin-category.service';
import AppConfigGuard from '../appconfig/appconfig.guard';

@ApiTags('bulletin-category')
@ApiBearerAuth()
@Controller('bulletin-category')
export class BulletinCategoryController {
  constructor(private readonly bulletinBoardService: BulletinCategoryService) {}

  @Get()
  findAll(@GetCurrentUsername() currentUsername: string) {
    return this.bulletinBoardService.findAll(currentUsername);
  }

  @Post()
  create(@GetCurrentUsername() currentUsername: string, @Body() bulletinCategory: BulletinCategoryDto) {
    return this.bulletinBoardService.create(currentUsername, bulletinCategory);
  }

  @Get(':name')
  @UseGuards(AppConfigGuard)
  getConfigByName(@Param('name') name: string) {
    return this.bulletinBoardService.getConfigByName(name);
  }

  @Get('exists/:name')
  async checkName(@Param('name') name: string): Promise<{ exists: boolean }> {
    return this.bulletinBoardService.checkIfNameExists(name);
  }

  @Patch(':id')
  update(
    @GetCurrentUsername() currentUsername: string,
    @Param('id') id: string,
    @Body() bulletinCategory: BulletinCategoryDto,
  ) {
    return this.bulletinBoardService.update(currentUsername, id, bulletinCategory);
  }

  @Delete(':id')
  remove(@GetCurrentUsername() currentUsername: string, @Param('id') id: string) {
    return this.bulletinBoardService.remove(currentUsername, id);
  }
}

export default BulletinCategoryController;
