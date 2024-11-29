import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import { BulletinCategoryService } from './bulletin-category.service';

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
