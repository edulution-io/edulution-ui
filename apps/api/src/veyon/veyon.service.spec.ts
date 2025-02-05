/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { Readable } from 'stream';
import VEYON_FEATURE_ACTIONS from '@libs/veyon/constants/veyonFeatureActions';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { framebufferConfigLow } from '@libs/veyon/constants/framebufferConfig';
import VEYON_API_AUTH_RESPONSE_KEYS from '@libs/veyon/constants/veyonApiAuthResponse';
import { type AppConfigDto } from '@libs/appconfig/types';
import type VeyonUserResponse from '@libs/veyon/types/veyonUserResponse';
import VeyonService from './veyon.service';
import UsersService from '../users/users.service';
import AppConfigService from '../appconfig/appconfig.service';

const mockAppConfig = {
  name: 'Test',
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
      });

      const result = await service.authenticate('127.0.0.1', 'username', 'veyonUser');

      expect(result).toEqual(mockedAuthData);
    });

    it('should throw HttpException if AxiosError occurs', async () => {
      const mockPassword = 'test-password';
      jest.spyOn(usersService, 'getPassword').mockResolvedValue(mockPassword);
      mockedAxios.post.mockRejectedValue({
        response: { status: 500 },
        message: 'Test error',
      });

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
      mockedAxios.get.mockRejectedValue({
        response: { status: 500 },
        message: 'Test error',
      });

      await expect(service.getUser('test-uid')).rejects.toThrow(HttpException);
    });
  });

  describe('setFeature', () => {
    it('should return an empty object if successful', async () => {
      const mockResponse = {};
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(mockAppConfig as AppConfigDto);

      await service.updateVeyonProxyConfig();

      (service['veyonApi'].put as jest.Mock).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await service.setFeature(VEYON_FEATURE_ACTIONS.SCREENLOCK, { active: true }, 'test-uid');

      expect(result).toEqual({});
    });

    it('should throw HttpException if an error occurs', async () => {
      mockedAxios.put.mockRejectedValue({
        response: { status: 500 },
        message: 'Test error',
      });

      await expect(service.setFeature(VEYON_FEATURE_ACTIONS.SCREENLOCK, { active: true }, 'test-uid')).rejects.toThrow(
        HttpException,
      );
    });
  });
});
