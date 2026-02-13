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

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import VEYON_FEATURE_ACTIONS from '@libs/veyon/constants/veyonFeatureActions';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariant';
import { framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';
import VEYON_API_AUTH_RESPONSE_KEYS from '@libs/veyon/constants/veyonApiAuthResponse';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type VeyonUserResponse from '@libs/veyon/types/veyonUserResponse';
import type VeyonFeaturesResponse from '@libs/veyon/types/veyonFeaturesResponse';
import type UserConnectionsFeatureStates from '@libs/veyon/types/userConnectionsFeatureState';
import VeyonService from './veyon.service';
import UsersService from '../users/users.service';
import AppConfigService from '../appconfig/appconfig.service';

const mockAppConfig = {
  name: 'filesharing',
  icon: 'icon-path',
  appType: APP_INTEGRATION_VARIANT.NATIVE,
  options: {
    url: 'test/path',
    apiKey: '123456789',
  },
  accessGroups: [
    { id: '1', value: 'group1', name: 'group1', path: 'group1', label: 'group1' },
    { id: '2', value: 'group2', name: 'group2', path: 'group2', label: 'group2' },
  ],
  extendedOptions: {
    VEYON_PROXYS: [{ subnet: '244.178.44.111', proxyAdress: 'http://localhost:1234' }],
  },
};

const mockedAuthData = {
  ip: '127.0.0.1',
  veyonUsername: 'veyonUser',
  connectionUid: 'test-uid',
  validUntil: 1234567890,
};

const mockUserResponse: VeyonUserResponse = {
  fullName: 'veyonUser',
  login: 'domain\\veyonUser',
  session: 0,
};

const mockedFeatureResponse: VeyonFeaturesResponse[] = [
  {
    active: 'true',
    name: 'testuser',
    parentUid: '1234',
    uid: '1234',
  },
];

const mockedUsersFeatureResponse: UserConnectionsFeatureStates = {
  'test-uid': mockedFeatureResponse,
};

const mockedRejectObject = {
  response: { status: HttpStatus.INTERNAL_SERVER_ERROR },
  message: 'Test error',
};

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

mockedAxios.create.mockReturnValue({
  defaults: { baseURL: 'http://localhost:1234/api/v1' },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
} as unknown as AxiosInstance);

describe('VeyonService', () => {
  let service: VeyonService;
  let usersService: UsersService;
  let appConfigService: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeyonService,
        {
          provide: UsersService,
          useValue: {
            getPassword: jest.fn(),
          },
        },
        {
          provide: AppConfigService,
          useValue: {
            getAppConfigByName: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VeyonService>(VeyonService);
    usersService = module.get<UsersService>(UsersService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateVeyonProxyConfig', () => {
    it('should update veyonApi instance if appConfig is valid', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValue(mockAppConfig as AppConfigDto);

      await service.updateVeyonProxyConfig();

      // eslint-disable-next-line @typescript-eslint/dot-notation
      expect(service['veyonApi'].defaults.baseURL).toBe('http://localhost:1234/api/v1');
    });

    it('should throw CustomHttpException if appConfig is invalid', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockRejectedValue(new Error('Config error'));

      await expect(service.updateVeyonProxyConfig()).rejects.toThrow(HttpException);
    });
  });

  describe('authenticate', () => {
    it('should return authentication data if successful', async () => {
      const mockPassword = 'test-password';
      const mockResponse = {
        [VEYON_API_AUTH_RESPONSE_KEYS.CONNECTION_UID]: 'test-uid',
        validUntil: 1234567890,
      };

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(mockPassword);
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValue(mockAppConfig as AppConfigDto);
      jest.spyOn(service, 'getUser').mockResolvedValue(mockUserResponse);

      await service.updateVeyonProxyConfig();

      (service['veyonApi'].post as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
        status: HttpStatus.OK,
      });

      const result = await service.authenticate('127.0.0.1', 'username', 'veyonUser');

      expect(result).toEqual(mockedAuthData);
    });

    it('should throw HttpException if AxiosError occurs', async () => {
      const mockPassword = 'test-password';
      jest.spyOn(usersService, 'getPassword').mockResolvedValue(mockPassword);
      mockedAxios.post.mockRejectedValue(mockedRejectObject);

      await expect(service.authenticate('127.0.0.1', 'username', 'veyonUser')).rejects.toThrow(HttpException);
    });
  });

  describe('getFrameBufferStream', () => {
    it('should return a readable stream if successful', async () => {
      const mockStream = new Readable({
        read() {
          this.push('mock data');
          this.push(null);
        },
      });

      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(mockAppConfig as AppConfigDto);

      await service.updateVeyonProxyConfig();

      (service['veyonApi'].get as jest.Mock).mockResolvedValueOnce({
        data: mockStream,
      });
      const result = await service.getFrameBufferStream('test-uid', framebufferConfigLow);

      expect(result).toBe(mockStream);
    });

    it('should return an empty stream if an error occurs', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Test error'));

      const result = await service.getFrameBufferStream('test-uid', framebufferConfigLow);

      expect(result.readable).toBe(true);
    });
  });

  describe('getUser', () => {
    it('should return user data if successful', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(mockAppConfig as AppConfigDto);

      await service.updateVeyonProxyConfig();

      (service['veyonApi'].get as jest.Mock).mockResolvedValueOnce({
        data: mockUserResponse,
      });

      const result = await service.getUser('test-uid');

      expect(result).toEqual(mockUserResponse);
    });

    it('should throw HttpException if an error occurs', async () => {
      mockedAxios.get.mockRejectedValue(mockedRejectObject);

      await expect(service.getUser('test-uid')).rejects.toThrow(HttpException);
    });
  });

  describe('setFeature', () => {
    it('should return an user feature status array if successful', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(mockAppConfig as AppConfigDto);

      await service.updateVeyonProxyConfig();

      (service['veyonApi'].put as jest.Mock).mockResolvedValueOnce({
        data: mockedUsersFeatureResponse,
      });

      jest.spyOn(service as any, 'pollFeatureState').mockResolvedValueOnce({});

      jest.spyOn(service, 'getFeatures').mockResolvedValueOnce(mockedFeatureResponse);

      const result = await service.setFeature(VEYON_FEATURE_ACTIONS.SCREENLOCK, {
        active: true,
        connectionUids: ['test-uid'],
      });

      expect(result).toEqual(mockedUsersFeatureResponse);
    });

    it('should throw HttpException if an error occurs', async () => {
      mockedAxios.put.mockRejectedValue(mockedRejectObject);

      await expect(
        service.setFeature(VEYON_FEATURE_ACTIONS.SCREENLOCK, { active: true, connectionUids: ['test-uid'] }),
      ).rejects.toThrow(HttpException);
    });
  });

  describe('getFeatures', () => {
    it('should return features if successful', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(mockAppConfig as AppConfigDto);

      await service.updateVeyonProxyConfig();

      (service['veyonApi'].get as jest.Mock).mockResolvedValueOnce({
        data: mockedFeatureResponse,
      });

      const result = await service.getFeatures('test-uid');

      expect(result).toEqual(mockedFeatureResponse);
    });

    it('should throw HttpException if an error occurs', async () => {
      mockedAxios.get.mockRejectedValue(mockedRejectObject);

      await expect(service.getFeatures('test-uid')).rejects.toThrow(HttpException);
    });
  });
});
