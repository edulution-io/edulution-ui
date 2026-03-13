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

import { Body, Controller, Delete, Get, HttpStatus, Param, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import type { BatchPeersRequest, PeerRequest, SiteRequest } from '@libs/wireguard/types/wireguard';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import WIREGUARD_API_ENDPOINT from '@libs/wireguard/constants/wireguardApiEndpoint';
import WIREGUARD_ERROR_MESSAGES from '@libs/wireguard/constants/wireguardErrorMessages';
import WireguardService from './wireguard.service';
import AdminGuard from '../common/guards/admin.guard';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import CustomHttpException from '../common/CustomHttpException';

@Controller(WIREGUARD_API_ENDPOINT)
class WireguardController {
  constructor(private readonly wireguardService: WireguardService) {}

  @Get('user/peer')
  async getUserPeer(@GetCurrentUsername() username: string) {
    const peers = await this.wireguardService.getPeers();
    const userPeer = peers[username];
    if (!userPeer) {
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.USER_PEER_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        WireguardController.name,
      );
    }
    return userPeer;
  }

  @Get('user/peer/config')
  async getUserPeerConfig(@GetCurrentUsername() username: string) {
    return this.wireguardService.getPeerConfig(username);
  }

  @Get('user/peer/qr')
  async getUserPeerQR(@GetCurrentUsername() username: string, @Res() res: Response) {
    const buffer = await this.wireguardService.getPeerQR(username);
    res.set(HTTP_HEADERS.ContentType, 'image/png');
    res.send(buffer);
  }

  @Get('user/peer/qr/b64')
  async getUserPeerQRBase64(@GetCurrentUsername() username: string) {
    return this.wireguardService.getPeerQRBase64(username);
  }

  @Get('user/peer/status')
  async getUserPeerStatus(@GetCurrentUsername() username: string) {
    return this.wireguardService.getPeerStatus(username);
  }

  @Get('peers')
  @UseGuards(AdminGuard)
  async getPeers() {
    return this.wireguardService.getPeers();
  }

  @Post('peers')
  @UseGuards(AdminGuard)
  async createPeer(@Body() peerRequest: PeerRequest) {
    return this.wireguardService.createPeer(peerRequest);
  }

  @Post('peers/batch')
  @UseGuards(AdminGuard)
  async createPeersBatch(@Body() request: BatchPeersRequest) {
    return this.wireguardService.createPeersBatch(request);
  }

  @Delete('peers/:peer')
  @UseGuards(AdminGuard)
  async deletePeer(@Param('peer') peer: string) {
    return this.wireguardService.deletePeer(peer);
  }

  @Get('peers/:peer/config')
  @UseGuards(AdminGuard)
  async getPeerConfig(@Param('peer') peer: string) {
    return this.wireguardService.getPeerConfig(peer);
  }

  @Get('peers/:peer/qr')
  @UseGuards(AdminGuard)
  async getPeerQR(@Param('peer') peer: string, @Res() res: Response) {
    const buffer = await this.wireguardService.getPeerQR(peer);
    res.set(HTTP_HEADERS.ContentType, 'image/png');
    res.send(buffer);
  }

  @Get('peers/:peer/qr/b64')
  @UseGuards(AdminGuard)
  async getPeerQRBase64(@Param('peer') peer: string) {
    return this.wireguardService.getPeerQRBase64(peer);
  }

  @Get('peers/:peer/status')
  @UseGuards(AdminGuard)
  async getPeerStatus(@Param('peer') peer: string) {
    return this.wireguardService.getPeerStatus(peer);
  }

  @Get('peers/status')
  @UseGuards(AdminGuard)
  async getAllPeersStatus() {
    return this.wireguardService.getAllPeersStatus();
  }

  @Get('restart')
  @UseGuards(AdminGuard)
  async restartWireGuard() {
    return this.wireguardService.restartWireGuard();
  }

  @Get('sites')
  @UseGuards(AdminGuard)
  async getSites() {
    return this.wireguardService.getSites();
  }

  @Post('sites')
  @UseGuards(AdminGuard)
  async createSite(@Body() siteRequest: SiteRequest) {
    return this.wireguardService.createSite(siteRequest);
  }

  @Delete('sites/:site')
  @UseGuards(AdminGuard)
  async deleteSite(@Param('site') site: string) {
    return this.wireguardService.deleteSite(site);
  }

  @Get('sites/:site/config')
  @UseGuards(AdminGuard)
  async getSiteConfig(@Param('site') site: string) {
    return this.wireguardService.getSiteConfig(site);
  }
}

export default WireguardController;
