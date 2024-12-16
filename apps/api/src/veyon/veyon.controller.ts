import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type VeyonAuthDto from '@libs/veyon/types/veyonAuth.dto';
import { Response } from 'express';
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

  @Get('framebuffer/:connectionUid')
  async streamFrameBuffer(@Param('connectionUid') connectionUid: string, @Res() res: Response): Promise<void> {
    const frameBufferStream = await this.veyonService.getFrameBufferStream(connectionUid);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="framebuffer_${connectionUid}.jpg"`,
    });
    frameBufferStream.pipe(res);
  }
}

export default VeyonController;
