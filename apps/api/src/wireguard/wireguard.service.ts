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

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import type {
  BatchPeersRequest,
  BatchPeersResult,
  Peer,
  PeerConfig,
  PeerRequest,
  WireguardPeer,
  Site,
  SiteRequest,
} from '@libs/wireguard/types/wireguard';
import WIREGUARD_ERROR_MESSAGES from '@libs/wireguard/constants/wireguardErrorMessages';
import type WireguardErrorMessages from '@libs/wireguard/types/wireguardErrorMessages';
import APPS from '@libs/appconfig/constants/apps';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import generateSecureToken from '@libs/common/utils/generateSecureToken';
import GroupsService from '../groups/groups.service';
import CustomHttpException from '../common/CustomHttpException';
import AppConfigService from '../appconfig/appconfig.service';

const { EDU_WG_API_URL, EDU_WG_API_KEY } = process.env;

const DEFAULT_WIREGUARD_URL = 'http://edulution-wireguard:8000/api/wireguard';
const WIREGUARD_API_KEY_HEADER = 'EDU_WG_API_KEY';

@Injectable()
class WireguardService implements OnModuleInit {
  private wireguardApi: AxiosInstance;

  constructor(
    private readonly groupsService: GroupsService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.wireguardApi = axios.create({
      baseURL: EDU_WG_API_URL || DEFAULT_WIREGUARD_URL,
      headers: {
        [WIREGUARD_API_KEY_HEADER]: EDU_WG_API_KEY || '',
      },
    });
  }

  async onModuleInit() {
    await this.initializeApiConfiguration();
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.WIREGUARD}`)
  async handleWireguardConfigUpdate() {
    await this.ensureWireguardConfigDefaultsOnCreate();
    await this.initializeApiConfiguration();
  }

  private async ensureWireguardConfigDefaultsOnCreate() {
    try {
      const wireguardConfig = await this.appConfigService.getAppConfigByName(APPS.WIREGUARD);

      if (!wireguardConfig) {
        Logger.log('WireGuard app config not found, skipping defaults generation', WireguardService.name);
        return;
      }

      const currentUrl = wireguardConfig.options?.url;
      const currentApiKey = wireguardConfig.options?.apiKey;

      if (currentUrl && currentApiKey) {
        return;
      }

      let needsUpdate = false;
      const updatedOptions = { ...wireguardConfig.options };

      if (!currentUrl) {
        updatedOptions.url = EDU_WG_API_URL || DEFAULT_WIREGUARD_URL;
        needsUpdate = true;
        Logger.log(`Setting WireGuard URL to: ${updatedOptions.url}`, WireguardService.name);
      }

      if (!currentApiKey) {
        updatedOptions.apiKey = EDU_WG_API_KEY || generateSecureToken();
        needsUpdate = true;
        Logger.log('Setting WireGuard API key', WireguardService.name);
      }

      if (needsUpdate) {
        await this.appConfigService.patchSingleFieldInConfig(
          APPS.WIREGUARD,
          { field: 'options', value: updatedOptions },
          [],
        );
        Logger.log('Initialized WireGuard AppConfig with URL and API key', WireguardService.name);
      }
    } catch (error) {
      Logger.warn('Failed to ensure WireGuard config defaults', WireguardService.name);
    }
  }

  private async initializeApiConfiguration() {
    try {
      const wireguardConfig = await this.appConfigService.getAppConfigByName(APPS.WIREGUARD);

      if (!wireguardConfig) {
        Logger.log('WireGuard app config not found', WireguardService.name);
        return;
      }

      const configUrl = wireguardConfig.options?.url;
      const configApiKey = wireguardConfig.options?.apiKey;

      const url = EDU_WG_API_URL || configUrl || DEFAULT_WIREGUARD_URL;
      const apiKey = EDU_WG_API_KEY || configApiKey || '';

      this.wireguardApi = axios.create({
        baseURL: url,
        headers: {
          EDU_WG_API_KEY: apiKey,
        },
      });

      Logger.log(`WireGuard API configured with URL: ${url}`, WireguardService.name);
    } catch (error) {
      Logger.warn('Failed to initialize WireGuard API configuration from AppConfig', WireguardService.name);
    }
  }

  private static async request<T>(fn: () => Promise<{ data: T }>, errorMessage: WireguardErrorMessages): Promise<T> {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      throw new CustomHttpException(errorMessage, HttpStatus.INTERNAL_SERVER_ERROR, error, WireguardService.name);
    }
  }

  async getPeers(): Promise<Record<string, Peer>> {
    return WireguardService.request(
      () => this.wireguardApi.get<Record<string, Peer>>('/peers'),
      WIREGUARD_ERROR_MESSAGES.GET_PEERS_FAILED,
    );
  }

  async createPeer(peerRequest: PeerRequest): Promise<boolean> {
    return WireguardService.request(
      () => this.wireguardApi.post<boolean>('/peers', peerRequest),
      WIREGUARD_ERROR_MESSAGES.CREATE_PEER_FAILED,
    );
  }

  async deletePeer(peer: string): Promise<boolean> {
    return WireguardService.request(
      () => this.wireguardApi.delete<boolean>(`/peers/${peer}`),
      WIREGUARD_ERROR_MESSAGES.DELETE_PEER_FAILED,
    );
  }

  async getPeerConfig(peer: string): Promise<PeerConfig> {
    return WireguardService.request(
      () => this.wireguardApi.get<PeerConfig>(`/peers/${peer}/config`),
      WIREGUARD_ERROR_MESSAGES.GET_PEER_CONFIG_FAILED,
    );
  }

  async getPeerQR(peer: string): Promise<Buffer> {
    const data = await WireguardService.request(
      () => this.wireguardApi.get<ArrayBuffer>(`/peers/${peer}/qr`, { responseType: 'arraybuffer' }),
      WIREGUARD_ERROR_MESSAGES.GET_PEER_QR_FAILED,
    );
    return Buffer.from(data);
  }

  async getPeerQRBase64(peer: string): Promise<string> {
    return WireguardService.request(
      () => this.wireguardApi.get<string>(`/peers/${peer}/qr/b64`),
      WIREGUARD_ERROR_MESSAGES.GET_PEER_QR_FAILED,
    );
  }

  async getPeerStatus(peer: string): Promise<WireguardPeer | false> {
    return WireguardService.request(
      () => this.wireguardApi.get<WireguardPeer | false>(`/peers/${peer}/status`),
      WIREGUARD_ERROR_MESSAGES.GET_PEER_STATUS_FAILED,
    );
  }

  async getAllPeersStatus(): Promise<Record<string, WireguardPeer>> {
    return WireguardService.request(
      () => this.wireguardApi.get<Record<string, WireguardPeer>>('/peers/status'),
      WIREGUARD_ERROR_MESSAGES.GET_PEERS_STATUS_FAILED,
    );
  }

  async restartWireGuard(): Promise<boolean> {
    return WireguardService.request(
      () => this.wireguardApi.get<boolean>('/restart'),
      WIREGUARD_ERROR_MESSAGES.RESTART_FAILED,
    );
  }

  async getSites(): Promise<Record<string, Site>> {
    return WireguardService.request(
      () => this.wireguardApi.get<Record<string, Site>>('/sites'),
      WIREGUARD_ERROR_MESSAGES.GET_SITES_FAILED,
    );
  }

  async createSite(siteRequest: SiteRequest): Promise<boolean> {
    return WireguardService.request(
      () => this.wireguardApi.post<boolean>('/sites', siteRequest),
      WIREGUARD_ERROR_MESSAGES.CREATE_SITE_FAILED,
    );
  }

  async deleteSite(site: string): Promise<boolean> {
    return WireguardService.request(
      () => this.wireguardApi.delete<boolean>(`/sites/${site}`),
      WIREGUARD_ERROR_MESSAGES.DELETE_SITE_FAILED,
    );
  }

  async getSiteConfig(site: string): Promise<PeerConfig> {
    return WireguardService.request(
      () => this.wireguardApi.get<PeerConfig>(`/sites/${site}/config`),
      WIREGUARD_ERROR_MESSAGES.GET_SITE_CONFIG_FAILED,
    );
  }

  async createPeersBatch(request: BatchPeersRequest): Promise<BatchPeersResult> {
    const attendees = request.attendees.map((a) => ({ username: a.username }));
    const usernames = await this.groupsService.getInvitedMembers(request.groups, attendees);
    const uniqueUsernames = [...new Set(usernames)];

    Logger.log(`Creating ${uniqueUsernames.length} peers in batch`, WireguardService.name);

    const results = await Promise.allSettled(
      uniqueUsernames.map((username) =>
        this.wireguardApi
          .post<boolean>('/peers', {
            name: username,
            routes: request.routes || ['0.0.0.0/0'],
          })
          .then(() => username),
      ),
    );

    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successful += 1;
      } else {
        failed += 1;
        const username = uniqueUsernames[index];
        const errorMessage = result.reason instanceof Error ? result.reason.message : String(result.reason);
        errors.push(`${username}: ${errorMessage}`);
        Logger.warn(`Failed to create peer for ${username}: ${errorMessage}`, WireguardService.name);
      }
    });

    Logger.log(`Batch peer creation completed: ${successful} successful, ${failed} failed`, WireguardService.name);

    return { successful, failed, errors };
  }
}

export default WireguardService;
