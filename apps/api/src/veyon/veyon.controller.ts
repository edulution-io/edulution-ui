import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type VeyonAuthDto from '@libs/veyon/types/veyonAuth.dto';
import VeyonService from './veyon.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@ApiTags('veyon')
@ApiBearerAuth()
@Controller('veyon')
class VeyonController {
  constructor(private readonly veyonService: VeyonService) {}

  @Post()
  async authentication(@Body() body: VeyonAuthDto, @GetCurrentUsername() username: string) {
    return this.veyonService.authenticate(body, username);
  }
}

export default VeyonController;
