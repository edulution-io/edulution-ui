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

  @Post('request')
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

  @Get('virtualmachines')
  async getVirtualMachines() {
    try {
      const response = await this.vdiService.getVirtualMachines();
      Logger.log('Get status of virtualmachines', VdiController.name);
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
