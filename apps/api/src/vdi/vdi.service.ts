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

import { HttpException, HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { OnEvent } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import {
  GuacamoleDto,
  LmnVdiRequest,
  LmnVdiResponse,
  SSHSessionDto,
  VdiErrorMessages,
  VirtualMachines,
} from '@libs/desktopdeployment/types';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import APPS from '@libs/appconfig/constants/apps';
import { GUACAMOLE_AUTH_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import CustomHttpException from '../common/CustomHttpException';
import UsersService from '../users/users.service';
import AppConfigService from '../appconfig/appconfig.service';

const { LMN_VDI_API_SECRET, LMN_VDI_API_URL, EDULUTION_GUACAMOLE_ADMIN_PASSWORD, EDULUTION_GUACAMOLE_ADMIN_USER } =
  process.env;

const GUACAMOLE_AUTH_CACHE_KEY = 'guacamole:auth';

@Injectable()
class VdiService implements OnModuleInit {
  private lmnVdiApi: AxiosInstance;

  private guacamoleApi: AxiosInstance;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private usersService: UsersService,
    private readonly appConfigService: AppConfigService,
  ) {
    this.lmnVdiApi = axios.create({
      baseURL: `${LMN_VDI_API_URL}/api`,
      headers: {
        'LMN-API-Secret': LMN_VDI_API_SECRET,
      },
    });
  }

  onModuleInit() {
    void this.updateVdiConfig();
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.DESKTOP_DEPLOYMENT}`)
  async updateVdiConfig() {
    try {
      const appConfig = await this.appConfigService.getAppConfigByName(APPS.DESKTOP_DEPLOYMENT).catch((error) => {
        if (error instanceof HttpException) {
          return null;
        }
        throw error;
      });

      if (!appConfig) {
        return;
      }

      const guacamoleUrl = appConfig.options.url;
      if (!guacamoleUrl) {
        return;
      }

      this.guacamoleApi = axios.create({
        baseURL: `${guacamoleUrl}/guacamole/api`,
      });
    } catch (error) {
      throw new CustomHttpException(VdiErrorMessages.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async authenticateVdi(forceRefresh = false): Promise<{ authToken: string; dataSource: string }> {
    if (!forceRefresh) {
      const cachedAuth = await this.cacheManager.get<{ authToken: string; dataSource: string }>(
        GUACAMOLE_AUTH_CACHE_KEY,
      );
      if (cachedAuth) {
        return cachedAuth;
      }
    }

    try {
      const response = await this.guacamoleApi.post<GuacamoleDto>(
        '/tokens',
        { username: EDULUTION_GUACAMOLE_ADMIN_USER, password: EDULUTION_GUACAMOLE_ADMIN_PASSWORD },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      const { authToken, dataSource } = response.data;

      const authData = { authToken, dataSource };
      await this.cacheManager.set(GUACAMOLE_AUTH_CACHE_KEY, authData, GUACAMOLE_AUTH_CACHE_TTL_MS);
      return authData;
    } catch (e) {
      await this.cacheManager.del(GUACAMOLE_AUTH_CACHE_KEY);
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async requestVdi(lmnVdiRequest: LmnVdiRequest) {
    try {
      const response = await this.lmnVdiApi.post<LmnVdiResponse>('/connection/request', lmnVdiRequest);
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getVirtualMachines() {
    try {
      const response = await this.lmnVdiApi.get<VirtualMachines>('/status/clones');
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.LmnVdiApiNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async createSSHSession(
    sshSessionDto: SSHSessionDto,
  ): Promise<{ authToken: string; dataSource: string; connectionUri: string }> {
    const { authToken } = await this.authenticateVdi();
    const { username, password } = sshSessionDto;

    let uri = 'ssh://';
    if (username) {
      uri += encodeURIComponent(username);
      if (password) {
        uri += `:${encodeURIComponent(password)}`;
      }
      uri += '@';
    }
    uri += 'host.docker.internal:22/';

    const connectionId = await this.createQuickconnect(authToken, uri);

    return { authToken, dataSource: 'quickconnect', connectionUri: connectionId };
  }

  private async createQuickconnect(authToken: string, uri: string): Promise<string> {
    try {
      const response = await this.guacamoleApi.post<{ identifier: string }>(
        `/session/ext/quickconnect/create?token=${encodeURIComponent(authToken)}`,
        `uri=${encodeURIComponent(uri)}`,
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      return response.data.identifier;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.QuickconnectFailed, HttpStatus.BAD_GATEWAY);
    }
  }

  async createRDPSession(
    username: string,
    hostname: string,
  ): Promise<{ authToken: string; dataSource: string; connectionUri: string }> {
    const { authToken } = await this.authenticateVdi();
    const password = await this.usersService.getPassword(username);

    const uri = `rdp://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}:3389/?security=nla&ignore-cert=true`;

    const connectionId = await this.createQuickconnect(authToken, uri);

    return { authToken, dataSource: 'quickconnect', connectionUri: connectionId };
  }
}

export default VdiService;
