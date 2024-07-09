import { Body, Controller, Get, Post } from '@nestjs/common';
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

  @Post('auth')
  /* Replace password when its available in db */
  authVdi(@Body() body: { username: string; password: string }) {
    return this.vdiService.authenticateVdi(body);
  }

  @Post('connections')
  getConnections(@Body() body: { dataSource: string; token: string }) {
    return this.vdiService.getConnections(body);
  }

  @Post()
  requestVdi(@Body() body: BodyType) {
    return this.vdiService.requestVdi(body);
  }

  @Get('virtualmachines')
  getVirtualMachines() {
    return this.vdiService.getVirtualMachines();
  }
}

export default VdiController;
