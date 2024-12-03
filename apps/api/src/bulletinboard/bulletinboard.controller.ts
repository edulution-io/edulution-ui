import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BulletinDto } from '@libs/bulletinBoard/type/bulletinDto';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import BulletinBoardService from './bulletinboard.service';

@ApiTags('bulletinboard')
@ApiBearerAuth()
@Controller('bulletinboard')
class BulletinBoardController {
  constructor(private readonly bulletinBoardService: BulletinBoardService) {}

  @Get()
  findAll(@GetCurrentUsername() currentUsername: string) {
    return this.bulletinBoardService.findAll(currentUsername);
  }

  @Post()
  create(@GetCurrentUsername() currentUsername: string, @Body() bulletin: BulletinDto) {
    return this.bulletinBoardService.create(currentUsername, bulletin);
  }

  @Patch(':id')
  update(@GetCurrentUsername() currentUsername: string, @Param('id') id: string, @Body() bulletin: BulletinDto) {
    return this.bulletinBoardService.update(currentUsername, id, bulletin);
  }

  @Delete(':id')
  remove(@GetCurrentUsername() currentUsername: string, @Param('id') id: string) {
    return this.bulletinBoardService.remove(currentUsername, id);
  }
}

export default BulletinBoardController;
