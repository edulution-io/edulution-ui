import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GuacamoleDto, LmnVdiRequest } from '@libs/desktopdeployment/types';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import VdiService from './vdi.service';

@ApiBearerAuth()
@Controller('vdi')
class VdiController {
  constructor(private readonly vdiService: VdiService) {}

  @Get()
  authVdi() {
    return this.vdiService.authenticateVdi();
  }

  @Post('connections')
  getConnection(@Body() guacamoleDto: GuacamoleDto, @GetCurrentUsername() username: string) {
    return this.vdiService.getConnection(guacamoleDto, username);
  }

  @Post('sessions')
  async createOrUpdateSession(@Body() guacamoleDto: GuacamoleDto, @GetCurrentUsername() username: string) {
    return this.vdiService.createOrUpdateSession(guacamoleDto, username);
  }

  @Post()
  requestVdi(@Body() lmnVdiRequest: LmnVdiRequest) {
    return this.vdiService.requestVdi(lmnVdiRequest);
  }

  @Get('virtualmachines')
  getVirtualMachines() {
    return this.vdiService.getVirtualMachines();
  }
}

export default VdiController;
