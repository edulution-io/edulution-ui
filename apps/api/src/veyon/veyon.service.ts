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
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import { OnEvent } from '@nestjs/event-emitter';
import type VeyonApiAuthResponse from '@libs/veyon/types/veyonApiAuthResponse';
import type FrameBufferConfig from '@libs/veyon/types/framebufferConfig';
import type VeyonUserResponse from '@libs/veyon/types/veyonUserResponse';
import type VeyonFeatureRequest from '@libs/veyon/types/veyonFeatureRequest';
import type VeyonFeatureUid from '@libs/veyon/types/veyonFeatureUid';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import type SuccessfullVeyonAuthResponse from '@libs/veyon/types/connectionUidResponse';
import type VeyonFeaturesResponse from '@libs/veyon/types/veyonFeaturesResponse';
import VEYON_AUTH_METHODS from '@libs/veyon/constants/veyonAuthMethods';
import APPS from '@libs/appconfig/constants/apps';
import VeyonErrorMessages from '@libs/veyon/constants/veyonErrorMessages';
import delay from '@libs/common/utils/delay';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import VEYON_API_AUTH_RESPONSE_KEYS from '@libs/veyon/constants/veyonApiAuthResponse';
import { VEYON_API_FEATURE_ENDPOINT, VEYON_API_FRAMEBUFFER_ENDPOINT } from '@libs/veyon/constants/veyonApiEndpoints';
import { HTTP_HEADERS, ResponseType } from '@libs/common/types/http-methods';
import type UserConnectionsFeatureStates from '@libs/veyon/types/userConnectionsFeatureState';
import CustomHttpException from '../common/CustomHttpException';
import UsersService from '../users/users.service';
import AppConfigService from '../appconfig/appconfig.service';

@Injectable()
class VeyonService implements OnModuleInit {
  private veyonApi: AxiosInstance;

  constructor(
    private readonly usersService: UsersService,
    private readonly appConfigService: AppConfigService,
  ) {}

  onModuleInit() {
    void this.updateVeyonProxyConfig();
  }

  @OnEvent(`${EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED}-${APPS.CLASS_MANAGEMENT}`)
  async updateVeyonProxyConfig() {
    try {
      const appConfig = await this.appConfigService.getAppConfigByName(APPS.CLASS_MANAGEMENT).catch((error) => {
        if (error instanceof HttpException) {
          return null;
        }
        throw error;
      });

      if (!appConfig?.extendedOptions || Object.keys(appConfig.extendedOptions).length === 0) {
        return;
      }

      // ToDo: Add support for more proxies https://github.com/edulution-io/edulution-ui/issues/352
      const veyonProxies = appConfig.extendedOptions.VEYON_PROXYS as VeyonProxyItem[];

      if (!Array.isArray(veyonProxies) || veyonProxies.length === 0) {
        return;
      }

      const veyonApiUrl = veyonProxies[0]?.proxyAdress ?? '';

      this.veyonApi = axios.create({
        baseURL: `${veyonApiUrl}/api/v1`,
      });
    } catch (error) {
      throw new CustomHttpException(
        VeyonErrorMessages.AppNotProperlyConfigured,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        VeyonService.name,
      );
    }
  }

  async authenticate(
    ip: string,
    username: string,
    veyonUser: string,
  ): Promise<SuccessfullVeyonAuthResponse | Record<string, never>> {
    const password = await this.usersService.getPassword(username);
    try {
      const response = await this.veyonApi.post<VeyonApiAuthResponse>(
        `/authentication/${ip}`,
        {
          method: VEYON_AUTH_METHODS.AUTHLOGON,
          credentials: { username, password },
        },
        {
          timeout: 60000,
          validateStatus: (valStatus) => valStatus < (HttpStatus.INTERNAL_SERVER_ERROR as number),
        },
      );

      if (response.status !== (HttpStatus.OK as number)) {
        return {};
      }

      const connectionUid = response.data[VEYON_API_AUTH_RESPONSE_KEYS.CONNECTION_UID];
      await delay(200);
      const user = await this.getUser(connectionUid);
      const veyonUsername = user.login.split('\\')[1];

      if (veyonUsername !== veyonUser) {
        return {};
      }

      return {
        ip,
        veyonUsername,
        connectionUid,
        validUntil: response.data.validUntil,
      };
    } catch (error) {
      throw new CustomHttpException(
        VeyonErrorMessages.VeyonApiNotReachable,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        VeyonService.name,
      );
    }
  }

  async getFrameBufferStream(connectionUid: string, framebufferConfig: FrameBufferConfig): Promise<Readable> {
    try {
      const { data } = await this.veyonApi.get<Readable>(VEYON_API_FRAMEBUFFER_ENDPOINT, {
        params: framebufferConfig,
        responseType: ResponseType.STREAM,
        headers: {
          [HTTP_HEADERS.CONNECTION_UID]: connectionUid,
        },
      });
      return data;
    } catch (error) {
      return new Readable({
        read() {
          this.push(null);
        },
      });
    }
  }

  async getUser(connectionUid: string): Promise<VeyonUserResponse> {
    try {
      const { data } = await this.veyonApi.get<VeyonUserResponse>('user', {
        headers: {
          [HTTP_HEADERS.CONNECTION_UID]: connectionUid,
        },
      });
      return data;
    } catch (error) {
      throw new CustomHttpException(
        VeyonErrorMessages.GetUserFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        VeyonService.name,
      );
    }
  }

  private async pollFeatureState(
    featureUid: VeyonFeatureUid,
    connectionUid: string,
    expectedState: boolean,
    retries = 0,
  ): Promise<void> {
    if (retries >= 10) {
      return;
    }
    const { data } = await this.veyonApi.get<{ active: boolean }>(`${VEYON_API_FEATURE_ENDPOINT}/${featureUid}`, {
      headers: { [HTTP_HEADERS.CONNECTION_UID]: connectionUid },
    });

    if (data.active === expectedState) {
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });

    await this.pollFeatureState(featureUid, connectionUid, expectedState, retries + 1);
  }

  async setFeature(featureUid: VeyonFeatureUid, body: VeyonFeatureRequest): Promise<UserConnectionsFeatureStates> {
    const { connectionUids } = body;
    try {
      await Promise.all(
        connectionUids.map(async (connectionUid) => {
          await this.veyonApi.put<Record<string, never>>(
            `${VEYON_API_FEATURE_ENDPOINT}/${featureUid}`,
            { active: body.active },
            {
              headers: { [HTTP_HEADERS.CONNECTION_UID]: connectionUid },
            },
          );
        }),
      );

      await Promise.all(
        connectionUids.map(async (connectionUid) => {
          await this.pollFeatureState(featureUid, connectionUid, body.active);
        }),
      );

      const veyonFeatures = (
        await Promise.all(
          connectionUids.map(async (connectionUid) => {
            const features = await this.getFeatures(connectionUid);
            return { [connectionUid]: features };
          }),
        )
      ).reduce((acc, curr) => ({ ...acc, ...curr }), {});

      return veyonFeatures;
    } catch (error) {
      throw new CustomHttpException(
        VeyonErrorMessages.VeyonApiNotReachable,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        VeyonService.name,
      );
    }
  }

  async getFeatures(connectionUid: string): Promise<VeyonFeaturesResponse[]> {
    try {
      const { data } = await this.veyonApi.get<VeyonFeaturesResponse[]>(VEYON_API_FEATURE_ENDPOINT, {
        headers: { [HTTP_HEADERS.CONNECTION_UID]: connectionUid },
      });
      return data;
    } catch (error) {
      throw new CustomHttpException(
        VeyonErrorMessages.VeyonApiNotReachable,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        VeyonService.name,
      );
    }
  }
}

export default VeyonService;
