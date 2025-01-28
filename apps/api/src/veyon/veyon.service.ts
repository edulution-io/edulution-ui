import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import axios, { AxiosInstance, AxiosError } from 'axios';
import { Readable } from 'stream';
import { OnEvent } from '@nestjs/event-emitter';
import type VeyonApiAuthResponse from '@libs/veyon/types/veyonApiAuthResponse';
import type FrameBufferConfig from '@libs/veyon/types/framebufferConfig';
import type VeyonUserResponse from '@libs/veyon/types/veyonUserResponse';
import type VeyonFeatureRequest from '@libs/veyon/types/veyonFeatureRequest';
import type VeyonFeatureUid from '@libs/veyon/types/veyonFeatureUid';
import type VeyonProxyItem from '@libs/veyon/types/veyonProxyItem';
import VEYON_AUTH_METHODS from '@libs/veyon/constants/veyonAuthMethods';
import APPS from '@libs/appconfig/constants/apps';
import CustomHttpException from '@libs/error/CustomHttpException';
import VeyonErrorMessages from '@libs/veyon/constants/veyonErrorMessages';
import delay from '@libs/common/utils/delay';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import VEYON_API_AUTH_RESPONSE_KEYS from '@libs/veyon/constants/veyonApiAuthResponse';
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

  @OnEvent(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED)
  async updateVeyonProxyConfig() {
    try {
      const appConfig = await this.appConfigService.getAppConfigByName(APPS.CLASS_MANAGEMENT);
      if (!appConfig.extendedOptions || !appConfig.extendedOptions.VEYON_PROXYS) {
        return;
      }

      // ToDo: Add support for more proxies https://github.com/edulution-io/edulution-ui/issues/352
      const veyonProxies = appConfig.extendedOptions.VEYON_PROXYS as VeyonProxyItem[];
      const veyonApiUrl = veyonProxies[0].proxyAdress;

      this.veyonApi = axios.create({
        baseURL: `${veyonApiUrl}/api/v1`,
      });
    } catch (error) {
      throw new CustomHttpException(VeyonErrorMessages.AppNotProperlyConfigured, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async authenticate(ip: string, username: string, veyonUser: string) {
    const password = await this.usersService.getPassword(username);
    try {
      const { data } = await this.veyonApi.post<VeyonApiAuthResponse>(
        `/authentication/${ip}`,
        {
          method: VEYON_AUTH_METHODS.AUTHLOGON,
          credentials: { username, password },
        },
        {
          timeout: 60000,
        },
      );

      const connectionUid = data[VEYON_API_AUTH_RESPONSE_KEYS.CONNECTION_UID];
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
        validUntil: data.validUntil,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error instanceof AxiosError ? error.message : 'Unknown error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async getFrameBufferStream(connectionUid: string, framebufferConfig: FrameBufferConfig): Promise<Readable> {
    try {
      const { data } = await this.veyonApi.get<Readable>(`/framebuffer`, {
        params: framebufferConfig,
        responseType: 'stream',
        headers: {
          'Connection-Uid': connectionUid,
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
      const { data } = await this.veyonApi.get<VeyonUserResponse>(`/user`, {
        headers: {
          'Connection-Uid': connectionUid,
        },
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error instanceof AxiosError ? error.message : 'Unknown error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }

  async setFeature(
    featureUid: VeyonFeatureUid,
    body: VeyonFeatureRequest,
    connectionUid: string,
  ): Promise<Record<string, never>> {
    try {
      const { data } = await this.veyonApi.put<Record<string, never>>(`feature/${featureUid}`, body, {
        headers: { 'Connection-Uid': connectionUid },
      });
      return data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          error instanceof AxiosError ? error.message : 'Unknown error',
          error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else {
        throw new HttpException('An unexpected error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}

export default VeyonService;
