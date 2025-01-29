import { Body, Controller, Get, Param, Post, Put, Query, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import type FrameBufferConfig from '@libs/veyon/types/framebufferConfig';
import type VeyonFeatureRequest from '@libs/veyon/types/veyonFeatureRequest';
import type VeyonFeatureUid from '@libs/veyon/types/veyonFeatureUid';
import {
  VEYON_API_ENDPOINT,
  VEYON_API_FEATURE_ENDPOINT,
  VEYON_API_FRAMEBUFFER_ENDPOINT,
} from '@libs/veyon/constants/veyonApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import VeyonService from './veyon.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@ApiTags(VEYON_API_ENDPOINT)
@ApiBearerAuth()
@Controller(VEYON_API_ENDPOINT)
class VeyonController {
  constructor(private readonly veyonService: VeyonService) {}

  @Post(':ip')
  async authentication(
    @Param('ip') ip: string,
    @GetCurrentUsername() username: string,
    @Body() body: { veyonUser: string },
  ) {
    const { veyonUser } = body;
    return this.veyonService.authenticate(ip, username, veyonUser);
  }

  @Get(`${VEYON_API_FRAMEBUFFER_ENDPOINT}/:connectionUid`)
  async streamFrameBuffer(
    @Param('connectionUid') connectionUid: string,
    @Res() res: Response,
    @Query() framebufferConfig: FrameBufferConfig,
  ): Promise<void> {
    const frameBufferStream = await this.veyonService.getFrameBufferStream(connectionUid, framebufferConfig);
    res.set({
      [HTTP_HEADERS.ContentType]: 'image/jpeg',
      [HTTP_HEADERS.ContentDisposition]: `inline; filename="framebuffer_${connectionUid}.jpg"`,
    });
    frameBufferStream.pipe(res);
  }

  @Put(`${VEYON_API_FEATURE_ENDPOINT}/:featureUid/:connectionUid`)
  async setFeature(
    @Param('featureUid') featureUid: VeyonFeatureUid,
    @Body() body: VeyonFeatureRequest,
    @Param('connectionUid') connectionUid: string,
  ) {
    return this.veyonService.setFeature(featureUid, body, connectionUid);
  }
}

export default VeyonController;
