import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import CustomHttpException from '@libs/error/CustomHttpException';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import FileSharingErrorMessage from '@libs/filesharing/types/fileSharingErrorMessage';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import CustomFile from '@libs/filesharing/types/customFile';
import AppConfigService from '../appconfig/appconfig.service';
import TokenService from '../common/services/token.service';
import FilesystemService from './filesystem.service';
import OnlyofficeService from './onlyoffice.service';
import JWTUser from '../types/JWTUser';

jest.mock('@libs/filesharing/utils/getPathWithoutWebdav');
jest.mock('./filesystem.service');

describe('OnlyofficeService', () => {
  let service: OnlyofficeService;
  let appConfigService: AppConfigService;
  let tokenService: TokenService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnlyofficeService,
        {
          provide: AppConfigService,
          useValue: {
            getAppConfigByName: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            isTokenValid: jest.fn(),
            getCurrentUser: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OnlyofficeService>(OnlyofficeService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
    tokenService = module.get<TokenService>(TokenService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOnlyOfficeToken', () => {
    it('should generate and return a token', async () => {
      const mockConfig = {
        extendedOptions: [{ name: 'ONLY_OFFICE_JWT_SECRET', value: 'secret' }],
      };
      (appConfigService.getAppConfigByName as jest.Mock).mockResolvedValue(mockConfig);
      (jwtService.sign as jest.Mock).mockReturnValue('signed-token');

      const token = await service.generateOnlyOfficeToken('payload');
      expect(appConfigService.getAppConfigByName).toHaveBeenCalledWith('filesharing');
      expect(jwtService.sign).toHaveBeenCalledWith('payload', { secret: 'secret' });
      expect(token).toBe('signed-token');
    });

    it('should throw an error if the JWT secret is not found', async () => {
      const mockConfig = { extendedOptions: [] };
      (appConfigService.getAppConfigByName as jest.Mock).mockResolvedValue(mockConfig);

      await expect(service.generateOnlyOfficeToken('payload')).rejects.toThrow(CustomHttpException);
      await expect(service.generateOnlyOfficeToken('payload')).rejects.toThrow(
        ConferencesErrorMessage.AppNotProperlyConfigured,
      );
    });
  });

  describe('handleCallback', () => {
    const mockRequest = {
      body: {
        status: 2,
        url: 'http://example.com/file',
        key: 'some-key',
      },
    } as Request;

    const mockUser = {
      preferred_username: 'username',
    } as JWTUser;

    const mockUploadFile = jest.fn();

    beforeEach(() => {
      (tokenService.isTokenValid as jest.Mock).mockResolvedValue(true);
      (tokenService.getCurrentUser as jest.Mock).mockResolvedValue(mockUser);
      (getPathWithoutWebdav as jest.Mock).mockReturnValue('cleaned/path');
    });

    it('should handle the callback and upload the file successfully', async () => {
      const mockFile = {} as CustomFile;
      (FilesystemService.retrieveAndSaveFile as jest.Mock).mockResolvedValue(mockFile);

      await service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile);

      expect(tokenService.isTokenValid).toHaveBeenCalledWith('eduToken');
      expect(tokenService.getCurrentUser).toHaveBeenCalledWith('eduToken');
      expect(FilesystemService.retrieveAndSaveFile).toHaveBeenCalledWith('filename', mockRequest.body);
      expect(mockUploadFile).toHaveBeenCalledWith('username', 'cleaned/path', mockFile, '');
    });

    it('should throw an error if the user is not authenticated', async () => {
      (tokenService.isTokenValid as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      await expect(service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile)).rejects.toThrow(
        FileSharingErrorMessage.UploadFailed,
      );
    });

    it('should throw an error if the user is not found', async () => {
      (tokenService.getCurrentUser as jest.Mock).mockResolvedValue(null);

      await expect(service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile)).rejects.toThrow(
        FileSharingErrorMessage.UploadFailed,
      );
    });

    it('should throw an error if the file is not retrieved and saved', async () => {
      (FilesystemService.retrieveAndSaveFile as jest.Mock).mockResolvedValue(undefined);

      await expect(service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile)).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.handleCallback(mockRequest, 'path', 'filename', 'eduToken', mockUploadFile)).rejects.toThrow(
        FileSharingErrorMessage.FileNotFound,
      );
    });

    it('should not call uploadFile if callbackData.status is not 2 or 4', async () => {
      const mockRequestInvalidStatus = {
        body: {
          status: 1,
          url: 'http://example.com/file',
          key: 'some-key',
        },
      } as Request;

      await service.handleCallback(mockRequestInvalidStatus, 'path', 'filename', 'eduToken', mockUploadFile);

      expect(FilesystemService.retrieveAndSaveFile).not.toHaveBeenCalled();
      expect(mockUploadFile).not.toHaveBeenCalled();
    });
  });
});
