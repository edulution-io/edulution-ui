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

import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import type { Peer, PeerConfig, PeerRequest, PeerStatus, Site, SiteRequest } from '@libs/wireguard/types/wireguard';
import WIREGUARD_ERROR_MESSAGES from '@libs/wireguard/constants/wireguardErrorMessages';
import CustomHttpException from '../common/CustomHttpException';

const { EDU_EG_API_URL, EDU_WG_API_KEY } = process.env;

@Injectable()
class WireguardService {
  private readonly wireguardApi: AxiosInstance;

  constructor() {
    if (!EDU_WG_API_KEY) {
      Logger.warn('EDU_WG_API_KEY not set in environment', WireguardService.name);
    }

    this.wireguardApi = axios.create({
      baseURL: EDU_EG_API_URL || 'http://edulution-wireguard:8000/api/wireguard',
      headers: {
        EDU_WG_API_KEY: EDU_WG_API_KEY || '',
      },
    });
  }

  async getPeers(): Promise<Record<string, Peer>> {
    try {
      const response = await this.wireguardApi.get<Record<string, Peer>>('/peers');
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get peers: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_PEERS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async createPeer(peerRequest: PeerRequest): Promise<boolean> {
    try {
      const response = await this.wireguardApi.post<boolean>('/peers', peerRequest);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to create peer: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.CREATE_PEER_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async deletePeer(peer: string): Promise<boolean> {
    try {
      const response = await this.wireguardApi.delete<boolean>(`/peers/${peer}`);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to delete peer: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.DELETE_PEER_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getPeerConfig(peer: string): Promise<PeerConfig> {
    try {
      const response = await this.wireguardApi.get<PeerConfig>(`/peers/${peer}/config`);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get peer config: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_PEER_CONFIG_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getPeerQR(peer: string): Promise<Buffer> {
    try {
      const response = await this.wireguardApi.get<ArrayBuffer>(`/peers/${peer}/qr`, {
        responseType: 'arraybuffer',
      });
      return Buffer.from(response.data);
    } catch (error) {
      Logger.error(
        `Failed to get peer QR: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_PEER_QR_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getPeerQRBase64(peer: string): Promise<string> {
    try {
      const response = await this.wireguardApi.get<string>(`/peers/${peer}/qr/b64`);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get peer QR base64: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_PEER_QR_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getPeerStatus(peer: string): Promise<PeerStatus | false> {
    try {
      const response = await this.wireguardApi.get<PeerStatus | false>(`/peers/${peer}/status`);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get peer status: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_PEER_STATUS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getAllPeersStatus(): Promise<Record<string, PeerStatus>> {
    try {
      const response = await this.wireguardApi.get<Record<string, PeerStatus>>('/peers/status');
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get all peers status: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_PEERS_STATUS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async restartWireGuard(): Promise<boolean> {
    try {
      const response = await this.wireguardApi.get<boolean>('/restart');
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to restart WireGuard: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.RESTART_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getSites(): Promise<Record<string, Site>> {
    try {
      const response = await this.wireguardApi.get<Record<string, Site>>('/sites');
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get sites: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_SITES_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async createSite(siteRequest: SiteRequest): Promise<boolean> {
    try {
      const response = await this.wireguardApi.post<boolean>('/sites', siteRequest);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to create site: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.CREATE_SITE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async deleteSite(site: string): Promise<boolean> {
    try {
      const response = await this.wireguardApi.delete<boolean>(`/sites/${site}`);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to delete site: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.DELETE_SITE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }

  async getSiteConfig(site: string): Promise<PeerConfig> {
    try {
      const response = await this.wireguardApi.get<PeerConfig>(`/sites/${site}/config`);
      return response.data;
    } catch (error) {
      Logger.error(
        `Failed to get site config: ${error instanceof Error ? error.message : String(error)}`,
        WireguardService.name,
      );
      throw new CustomHttpException(
        WIREGUARD_ERROR_MESSAGES.GET_SITE_CONFIG_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        WireguardService.name,
      );
    }
  }
}

export default WireguardService;
