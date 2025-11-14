/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
