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

import { Body, Controller, Delete, Get, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { PeerRequest, SiteRequest } from '@libs/wireguard/types/wireguard';
import WIREGUARD_API_ENDPOINT from '@libs/wireguard/constants/wireguardApiEndpoint';
import WireguardService from './wireguard.service';
import AdminGuard from '../common/guards/admin.guard';

@Controller(WIREGUARD_API_ENDPOINT)
@UseGuards(AdminGuard)
class WireguardController {
  constructor(private readonly wireguardService: WireguardService) {}

  @Get('peers')
  async getPeers() {
    return this.wireguardService.getPeers();
  }

  @Post('peers')
  async createPeer(@Body() peerRequest: PeerRequest) {
    return this.wireguardService.createPeer(peerRequest);
  }

  @Delete('peers/:peer')
  async deletePeer(@Param('peer') peer: string) {
    return this.wireguardService.deletePeer(peer);
  }

  @Get('peers/:peer/config')
  async getPeerConfig(@Param('peer') peer: string) {
    return this.wireguardService.getPeerConfig(peer);
  }

  @Get('peers/:peer/qr')
  async getPeerQR(@Param('peer') peer: string, @Res() res: Response) {
    const buffer = await this.wireguardService.getPeerQR(peer);
    res.set('Content-Type', 'image/png');
    res.send(buffer);
  }

  @Get('peers/:peer/qr/b64')
  async getPeerQRBase64(@Param('peer') peer: string) {
    return this.wireguardService.getPeerQRBase64(peer);
  }

  @Get('peers/:peer/status')
  async getPeerStatus(@Param('peer') peer: string) {
    return this.wireguardService.getPeerStatus(peer);
  }

  @Get('peers/status')
  async getAllPeersStatus() {
    return this.wireguardService.getAllPeersStatus();
  }

  @Get('restart')
  async restartWireGuard() {
    return this.wireguardService.restartWireGuard();
  }

  @Get('sites')
  async getSites() {
    return this.wireguardService.getSites();
  }

  @Post('sites')
  async createSite(@Body() siteRequest: SiteRequest) {
    return this.wireguardService.createSite(siteRequest);
  }

  @Delete('sites/:site')
  async deleteSite(@Param('site') site: string) {
    return this.wireguardService.deleteSite(site);
  }

  @Get('sites/:site/config')
  async getSiteConfig(@Param('site') site: string) {
    return this.wireguardService.getSiteConfig(site);
  }
}

export default WireguardController;
