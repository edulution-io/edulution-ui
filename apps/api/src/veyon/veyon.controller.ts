import { Body, Controller, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import type FrameBufferConfig from '@libs/veyon/types/framebufferConfig';
import type VeyonFeatureRequest from '@libs/veyon/types/veyonFeatureRequest';
import type VeyonFeatureUid from '@libs/veyon/types/veyonFeatureUid';
import VeyonService from './veyon.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@ApiTags('veyon')
@ApiBearerAuth()
@Controller('veyon')
class VeyonController {
  constructor(private readonly veyonService: VeyonService) {}

  @Post(':ip')
  async authentication(@Param('ip') ip: string, @GetCurrentUsername() username: string) {
    return this.veyonService.authenticate(ip, username);
  }

  @Get('framebuffer/:connectionUid')
  async streamFrameBuffer(
    @Param('connectionUid') connectionUid: string,
    @Res() res: Response,
    @Query() framebufferConfig: FrameBufferConfig,
  ): Promise<void> {
    const frameBufferStream = await this.veyonService.getFrameBufferStream(connectionUid, framebufferConfig);
    res.set({
      'Content-Type': 'image/jpeg',
      'Content-Disposition': `inline; filename="framebuffer_${connectionUid}.jpg"`,
    });
    frameBufferStream.pipe(res);
  }

  @Get('user/:connectionUid')
  async getUser(@Param('connectionUid') connectionUid: string) {
    return this.veyonService.getUser(connectionUid);
  }

  @Put('feature/:featureUid/:connectionUid')
  async setFeature(
    @Param('featureUid') featureUid: VeyonFeatureUid,
    @Body() body: VeyonFeatureRequest,
    @Param('connectionUid') connectionUid: string,
  ) {
    return this.veyonService.setFeature(featureUid, body, connectionUid);
  }
}

export default VeyonController;
