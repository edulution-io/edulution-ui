import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import VdiService from './vdi.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

type LmnVdiBody = {
  group: string;
  user: string;
};

type GuacRequestBody = {
  id: number;
  dataSource: string;
  token: string;
  hostname: string;
};

@ApiBearerAuth()
@Controller('vdi')
class VdiController {
  constructor(private readonly vdiService: VdiService) {}

  @Get('auth')
  authVdi() {
    return this.vdiService.authenticateVdi();
  }

  @Post('connections')
  getConnections(@Body() body: GuacRequestBody, @GetCurrentUsername() username: string) {
    return this.vdiService.getConnections(body, username);
  }

  @Post('sessions')
  createOrUpdateSession(@Body() body: GuacRequestBody, @GetCurrentUsername() username: string) {
    return this.vdiService.createOrUpdateSession(body, username);
  }

  @Post()
  requestVdi(@Body() body: LmnVdiBody) {
    return this.vdiService.requestVdi(body);
  }

  @Get('virtualmachines')
  getVirtualMachines() {
    return this.vdiService.getVirtualMachines();
  }
}

export default VdiController;
