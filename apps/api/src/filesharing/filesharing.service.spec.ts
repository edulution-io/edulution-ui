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

import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { createJwtUser } from '@libs/test-utils/api-mocks';
import FilesharingService from './filesharing.service';
import { PublicShare } from './publicFileShare.schema';
import WebdavService from '../webdav/webdav.service';
import OnlyofficeService from './onlyoffice.service';
import FilesystemService from '../filesystem/filesystem.service';
import QueueService from '../queue/queue.service';
import UsersService from '../users/users.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';

describe(FilesharingService.name, () => {
  let service: FilesharingService;
  let shareModel: Record<string, jest.Mock>;
  let webdavService: Record<string, jest.Mock>;
  let usersService: Record<string, jest.Mock>;
  let queueService: Record<string, jest.Mock>;
  let webdavSharesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    shareModel = {
      create: jest.fn(),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([]),
          }),
        }),
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
      findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      }),
      findOneAndUpdate: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      }),
      deleteMany: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
      }),
    };

    webdavService = {
      getClient: jest.fn().mockResolvedValue({}),
      uploadFile: jest.fn().mockResolvedValue({ status: 'ok' }),
      getFileTypeFromWebdavPath: jest.fn().mockResolvedValue('file'),
    };

    usersService = {
      findOne: jest.fn().mockResolvedValue({ username: 'teacher' }),
    };

    queueService = {
      addJobForUser: jest.fn().mockResolvedValue(undefined),
    };

    webdavSharesService = {
      getWebdavShareFromCache: jest.fn().mockResolvedValue({
        pathname: '/webdav',
        url: 'https://webdav.example.com/webdav',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesharingService,
        { provide: getModelToken(PublicShare.name), useValue: shareModel },
        { provide: WebdavService, useValue: webdavService },
        { provide: OnlyofficeService, useValue: { generateOnlyOfficeToken: jest.fn() } },
        { provide: FilesystemService, useValue: { fileLocation: jest.fn() } },
        { provide: QueueService, useValue: queueService },
        { provide: UsersService, useValue: usersService },
        { provide: WebdavSharesService, useValue: webdavSharesService },
      ],
    }).compile();

    service = module.get<FilesharingService>(FilesharingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('deleteFileAtPath', () => {
    it('should enqueue delete jobs for each path', async () => {
      await service.deleteFileAtPath('teacher', ['/docs/report.pdf'], 'default');

      expect(queueService.addJobForUser).toHaveBeenCalledWith(
        'teacher',
        'delete-file',
        expect.objectContaining({ username: 'teacher' }),
      );
    });

    it('should enqueue delete jobs for multiple paths', async () => {
      await service.deleteFileAtPath('teacher', ['/a.txt', '/b.txt'], 'default');

      expect(queueService.addJobForUser).toHaveBeenCalledTimes(2);
    });
  });

  describe('collectFiles', () => {
    it('should enqueue collect jobs for each request', async () => {
      const collectRequests = [{ source: '/file1', destination: '/dest1' }];

      await service.collectFiles('teacher', collectRequests as never[], 'teacher', 'copy' as never, 'default');

      expect(queueService.addJobForUser).toHaveBeenCalledWith(
        'teacher',
        'collect-file',
        expect.objectContaining({ username: 'teacher', operationType: 'copy' }),
      );
    });
  });

  describe('moveOrRenameResources', () => {
    it('should enqueue move jobs for each path change', async () => {
      const changes = [{ path: '/old.txt', newPath: '/new.txt' }];

      await service.moveOrRenameResources('teacher', changes, 'default');

      expect(queueService.addJobForUser).toHaveBeenCalledWith(
        'teacher',
        'move-or-rename-file',
        expect.objectContaining({ username: 'teacher' }),
      );
    });
  });

  describe('createPublicShare', () => {
    it('should create a public share and return success', async () => {
      const user = createJwtUser();
      usersService.findOne.mockResolvedValue({ username: user.preferred_username });
      shareModel.create.mockResolvedValue({
        publicShareId: 'abc-123',
        filename: 'test.pdf',
        filePath: '/docs/test.pdf',
        creator: { firstName: user.given_name, lastName: user.family_name, username: user.preferred_username },
      });

      const result = await service.createPublicShare(user, {
        etag: 'etag-1',
        share: 'default',
        filename: 'test.pdf',
        filePath: '/docs/test.pdf',
        invitedAttendees: [],
        invitedGroups: [],
      } as never);

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });

    it('should return error when user is not found', async () => {
      const user = createJwtUser();
      usersService.findOne.mockResolvedValue(null);

      const result = await service.createPublicShare(user, {
        etag: 'etag-1',
        share: 'default',
        filename: 'test.pdf',
        filePath: '/docs/test.pdf',
        invitedAttendees: [],
        invitedGroups: [],
      } as never);

      expect(result.success).toBe(false);
      expect(result.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('listPublicShares', () => {
    it('should return public shares for the user', async () => {
      const user = createJwtUser();
      shareModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValue([
              {
                publicShareId: 'abc',
                filename: 'test.pdf',
                creator: { username: user.preferred_username },
                invitedAttendees: [],
                invitedGroups: [],
              },
            ]),
          }),
        }),
      });

      const result = await service.listPublicShares(user);

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });
  });

  describe('deletePublicShares', () => {
    it('should throw NOT_FOUND when documents to delete do not match count', async () => {
      const user = createJwtUser();
      shareModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        service.deletePublicShares(user.preferred_username, [{ publicShareId: 'abc' }] as never[]),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });

    it('should delete shares when all belong to the user', async () => {
      const user = createJwtUser();
      const shareDoc = {
        publicShareId: 'abc',
        creator: { username: user.preferred_username },
      };

      shareModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([shareDoc]),
        }),
      });
      shareModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
      });

      const result = await service.deletePublicShares(user.preferred_username, [{ publicShareId: 'abc' }] as never[]);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(1);
    });

    it('should throw FORBIDDEN when trying to delete another user share', async () => {
      const user = createJwtUser();
      const foreignDoc = {
        publicShareId: 'abc',
        creator: { username: 'other-user' },
      };

      shareModel.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([foreignDoc]),
        }),
      });

      await expect(
        service.deletePublicShares(user.preferred_username, [{ publicShareId: 'abc' }] as never[]),
      ).rejects.toMatchObject({
        status: HttpStatus.FORBIDDEN,
      });
    });
  });

  describe('editPublicShare', () => {
    it('should update a public share and return success', async () => {
      const user = createJwtUser();
      const updatedShare = {
        publicShareId: 'abc',
        creator: { username: user.preferred_username },
        filename: 'test.pdf',
      };

      shareModel.findOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(updatedShare),
        }),
      });

      const result = await service.editPublicShare(user.preferred_username, {
        publicShareId: 'abc',
        scope: 'public',
      } as never);

      expect(result.success).toBe(true);
      expect(result.status).toBe(HttpStatus.OK);
    });

    it('should throw NOT_FOUND when share does not exist', async () => {
      shareModel.findOneAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await expect(service.editPublicShare('teacher', { publicShareId: 'nonexistent' } as never)).rejects.toMatchObject(
        {
          status: HttpStatus.NOT_FOUND,
        },
      );
    });
  });

  describe('getOnlyOfficeToken', () => {
    it('should delegate to onlyoffice service', async () => {
      const result = await service.getOnlyOfficeToken('payload');
      expect(result).toBeUndefined();
    });
  });
});
