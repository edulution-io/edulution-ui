import { Body, Controller, Get, HttpException, HttpStatus, Logger, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import VdiService from './vdi.service';

type BodyType = {
  group: string;
  user: string;
};
@ApiBearerAuth()
@Controller('vdi')
class VdiController {
  constructor(private readonly vdiService: VdiService) {}

  @Post()
  async requestVdi(@Body() body: BodyType) {
    try {
      const response = await this.vdiService.requestVdi(body);
      Logger.log('Request connection for user', VdiController.name);
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  @Get('clones')
  async getStatusOfClones() {
    try {
      const response = await this.vdiService.getStatusOfClones();
      Logger.log('Get status of clones', VdiController.name);
      return response;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default VdiController;
