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

import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import axios, { AxiosInstance } from 'axios';
import {
  Attributes,
  GuacamoleConnections,
  GuacamoleDto,
  LmnVdiRequest,
  LmnVdiResponse,
  Parameters,
  RDPConnection,
  VdiErrorMessages,
  VirtualMachines,
} from '@libs/desktopdeployment/types';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import APPS from '@libs/appconfig/constants/apps';
import CustomHttpException from '../common/CustomHttpException';
import UsersService from '../users/users.service';
import AppConfigService from '../appconfig/appconfig.service';

const { LMN_VDI_API_SECRET, LMN_VDI_API_URL, EDULUTION_GUACAMOLE_ADMIN_PASSWORD, EDULUTION_GUACAMOLE_ADMIN_USER } =
  process.env;

@Injectable()
class VdiService implements OnModuleInit {
  private lmnVdiApi: AxiosInstance;

  private guacamoleApi: AxiosInstance;

  private vdiId = '';

  constructor(
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

  static createRDPConnection(
    username: string,
    customParams: Partial<Parameters> = {},
    customAttributes: Partial<Attributes> = {},
  ): RDPConnection {
    const rdpConnection = new RDPConnection();
    rdpConnection.name = `${username}`;
    rdpConnection.parameters = { ...rdpConnection.parameters, ...customParams };
    rdpConnection.attributes = { ...rdpConnection.attributes, ...customAttributes };
    return rdpConnection;
  }

  static getConnectionIdentifier(connections: GuacamoleConnections, username: string): string | null {
    const connectionValues = Object.values(connections);
    const connection = connectionValues.find((itm) => itm.name === username);

    if (connection) {
      return connection.identifier;
    }

    return null;
  }

  async authenticateVdi() {
    try {
      const response = await this.guacamoleApi.post<GuacamoleDto>(
        '/tokens',
        { username: EDULUTION_GUACAMOLE_ADMIN_USER, password: EDULUTION_GUACAMOLE_ADMIN_PASSWORD },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        },
      );
      const { authToken, dataSource } = response.data;

      return { authToken, dataSource };
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async getConnection(guacamoleDto: GuacamoleDto, username: string) {
    try {
      const { dataSource, authToken } = guacamoleDto;
      const response = await this.guacamoleApi.get<GuacamoleConnections>(
        `/session/data/${dataSource}/connections?token=${authToken}`,
      );
      const identifier = VdiService.getConnectionIdentifier(response.data, username);
      if (identifier) this.vdiId = identifier;
      return identifier;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async createOrUpdateSession(guacamoleDto: GuacamoleDto, username: string) {
    const identifier = await this.getConnection(guacamoleDto, username);
    const password = await this.usersService.getPassword(username);
    if (identifier != null) {
      return this.updateSession(guacamoleDto, username, password);
    }
    return this.createSession(guacamoleDto, username, password);
  }

  async createSession(guacamoleDto: GuacamoleDto, username: string, password: string) {
    const { dataSource, authToken, hostname } = guacamoleDto;
    try {
      const rdpConnection = VdiService.createRDPConnection(username, {
        hostname,
        username,
        password,
      });

      const response = await this.guacamoleApi.post<GuacamoleDto>(
        `/session/data/${dataSource}/connections?token=${authToken}`,
        rdpConnection,
      );
      return response.data;
    } catch (e) {
      throw new CustomHttpException(VdiErrorMessages.GuacamoleNotResponding, HttpStatus.BAD_GATEWAY);
    }
  }

  async updateSession(guacamoleDto: GuacamoleDto, username: string, password: string) {
    try {
      const { dataSource, authToken, hostname } = guacamoleDto;
      const rdpConnection = VdiService.createRDPConnection(username, {
        hostname,
        username,
        password,
      });

      await this.guacamoleApi.put<GuacamoleDto>(
        `/session/data/${dataSource}/connections/${this.vdiId}?token=${authToken}`,
        rdpConnection,
      );

      return guacamoleDto;
    } catch (e) {
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
}

export default VdiService;
