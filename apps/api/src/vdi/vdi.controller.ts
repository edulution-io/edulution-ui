import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GuacRequest, LmnVdiRequest } from '@libs/desktopdeployment/types';
import VdiService from './vdi.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@ApiBearerAuth()
@Controller('vdi')
class VdiController {
  constructor(private readonly vdiService: VdiService) {}

  @Get('auth')
  authVdi() {
    return this.vdiService.authenticateVdi();
  }

  @Post('connections')
  getConnections(@Body() body: GuacRequest, @GetCurrentUsername() username: string) {
    return this.vdiService.getConnections(body, username);
  }

  @Post('sessions')
  createOrUpdateSession(@Body() body: GuacRequest, @GetCurrentUsername() username: string) {
    return this.vdiService.createOrUpdateSession(body, username);
  }

  @Post()
  requestVdi(@Body() body: LmnVdiRequest) {
    return this.vdiService.requestVdi(body);
  }

  @Get('virtualmachines')
  getVirtualMachines() {
    return this.vdiService.getVirtualMachines();
  }
}

export default VdiController;
