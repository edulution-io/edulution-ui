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

import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GROUP_WITH_MEMBERS_CACHE_KEY, USER_GROUPS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import cacheManagerMock from '../common/mocks/cacheManagerMock';
import ProfilePictureService from './profilePicture.service';

jest.mock('fs-extra', () => ({
  __esModule: true,
  pathExists: jest.fn(),
  unlink: jest.fn().mockResolvedValue(undefined),
  default: {
    pathExists: jest.fn(),
    unlink: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('sharp', () => {
  const mockSharp = jest.fn().mockReturnValue({
    resize: jest.fn().mockReturnValue({
      webp: jest.fn().mockReturnValue({
        toBuffer: jest.fn().mockResolvedValue(Buffer.from('compressed')),
      }),
    }),
    toFile: jest.fn().mockResolvedValue(undefined),
  });
  return mockSharp;
});

jest.mock('../filesystem/filesystem.service', () => ({
  __esModule: true,
  default: {
    ensureDirectoryExists: jest.fn().mockResolvedValue(undefined),
    readFile: jest.fn().mockResolvedValue(Buffer.from('image-data')),
  },
}));

describe(ProfilePictureService.name, () => {
  let service: ProfilePictureService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ProfilePictureService, { provide: CACHE_MANAGER, useValue: cacheManagerMock }],
    }).compile();

    service = module.get<ProfilePictureService>(ProfilePictureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('ensures cache directory exists', async () => {
      const { default: FilesystemService } = jest.requireMock('../filesystem/filesystem.service');

      await service.onModuleInit();

      expect(FilesystemService.ensureDirectoryExists).toHaveBeenCalled();
    });
  });

  describe('getProfilePicture', () => {
    it('returns null when file does not exist', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      const result = await service.getProfilePicture('alice');

      expect(result).toBeNull();
    });

    it('returns buffer and etag when file exists', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(true);

      const result = await service.getProfilePicture('alice');

      expect(result).not.toBeNull();
      expect(result!.buffer).toBeInstanceOf(Buffer);
      expect(result!.etag).toMatch(/^"[a-f0-9]+"$/);
    });
  });

  describe('saveProfilePicture', () => {
    it('checks file existence when base64Data is empty', async () => {
      const { pathExists } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      await service.saveProfilePicture('alice', '');

      expect(pathExists).toHaveBeenCalled();
    });

    it('does not delete file when it does not exist and base64Data is empty', async () => {
      const { pathExists, unlink } = jest.requireMock('fs-extra');
      pathExists.mockResolvedValue(false);

      await service.saveProfilePicture('alice', '');

      expect(unlink).not.toHaveBeenCalled();
    });

    it('compresses and saves image when base64Data is provided', async () => {
      const sharp = jest.requireMock('sharp');

      await service.saveProfilePicture('alice', 'data:image/png;base64,iVBOR');

      expect(sharp).toHaveBeenCalled();
    });
  });

  describe('isAllowedToView', () => {
    it('returns true when requesting own profile picture', async () => {
      const result = await service.isAllowedToView('alice', 'alice');

      expect(result).toBe(true);
    });

    it('returns false when user has no cached groups', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      const result = await service.isAllowedToView('alice', 'bob');

      expect(result).toBe(false);
    });

    it('returns true when target user is in a shared group', async () => {
      const groupPath = '/test-class';
      cacheManagerMock.get.mockImplementation((key: string) => {
        if (key === `${USER_GROUPS_CACHE_KEY}alice`) {
          return [{ path: groupPath, name: 'test-class' }];
        }
        if (key === `${GROUP_WITH_MEMBERS_CACHE_KEY}-${groupPath}`) {
          return { members: [{ username: 'alice' }, { username: 'bob' }] };
        }
        return null;
      });

      const result = await service.isAllowedToView('alice', 'bob');

      expect(result).toBe(true);
    });

    it('returns false when target user is not in any shared group', async () => {
      const groupPath = '/test-class';
      cacheManagerMock.get.mockImplementation((key: string) => {
        if (key === `${USER_GROUPS_CACHE_KEY}alice`) {
          return [{ path: groupPath, name: 'test-class' }];
        }
        if (key === `${GROUP_WITH_MEMBERS_CACHE_KEY}-${groupPath}`) {
          return { members: [{ username: 'alice' }, { username: 'charlie' }] };
        }
        return null;
      });

      const result = await service.isAllowedToView('alice', 'bob');

      expect(result).toBe(false);
    });
  });
});
