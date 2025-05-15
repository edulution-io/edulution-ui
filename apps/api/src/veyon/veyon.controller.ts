/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

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
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

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

  @Put(`${VEYON_API_FEATURE_ENDPOINT}/:featureUid`)
  async setFeature(@Param('featureUid') featureUid: VeyonFeatureUid, @Body() body: VeyonFeatureRequest) {
    return this.veyonService.setFeature(featureUid, body);
  }

  @Get(`${VEYON_API_FEATURE_ENDPOINT}/:connectionUid`)
  async getFeatures(@Param('connectionUid') connectionUid: string) {
    return this.veyonService.getFeatures(connectionUid);
  }
}

export default VeyonController;
