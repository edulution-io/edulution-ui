import { Body, Controller, Get, Post, Put } from '@nestjs/common';
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

  @Post('auth')
  /* Replace password when its available in db */
  authVdi(@Body() body: { username: string; password: string }) {
    return this.vdiService.authenticateVdi(body);
  }

  @Post('connections')
  getConnections(@Body() body: GuacRequestBody, @GetCurrentUsername() username: string) {
    return this.vdiService.getConnections(body, username);
  }

  @Get('session')
  getSession(@Body() body: GuacRequestBody) {
    return this.vdiService.getSession(body);
  }

  @Post('sessions')
  createOrUpdateSession(@Body() body: GuacRequestBody, @GetCurrentUsername() username: string) {
    return this.vdiService.createOrUpdateSession(body, username);
  }

  @Post('session')
  createSession(@Body() body: GuacRequestBody, @GetCurrentUsername() username: string) {
    return this.vdiService.createSession(body, username);
  }

  @Put('session')
  updateSession(@Body() body: GuacRequestBody, @GetCurrentUsername() username: string) {
    return this.vdiService.updateSession(body, username);
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
