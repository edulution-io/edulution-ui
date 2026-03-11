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
import { Test, TestingModule } from '@nestjs/testing';
import { createJwtUser } from '@libs/test-utils/api-mocks';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import WebdavService from '../webdav/webdav.service';
import ThumbnailService from './thumbnail.service';

describe(FilesharingController.name, () => {
  let controller: FilesharingController;
  let filesharingService: Record<string, jest.Mock>;
  let webdavService: Record<string, jest.Mock>;
  let thumbnailService: Record<string, jest.Mock>;

  beforeEach(async () => {
    filesharingService = {
      uploadFileViaWebDav: jest.fn().mockResolvedValue({ status: 'ok' }),
      deleteFileAtPath: jest.fn().mockResolvedValue(undefined),
      moveOrRenameResources: jest.fn().mockResolvedValue(undefined),
      getWebDavFileStream: jest.fn(),
      fileLocation: jest.fn().mockResolvedValue({ status: 'ok' }),
      getOnlyOfficeToken: jest.fn().mockResolvedValue('token'),
      duplicateFile: jest.fn().mockResolvedValue(undefined),
      copyFileOrFolder: jest.fn().mockResolvedValue(undefined),
      collectFiles: jest.fn().mockResolvedValue(undefined),
      createPublicShare: jest.fn().mockResolvedValue({ success: true }),
      listPublicShares: jest.fn().mockResolvedValue({ success: true }),
      deletePublicShares: jest.fn().mockResolvedValue({ success: true }),
      editPublicShare: jest.fn().mockResolvedValue({ success: true }),
      getPublicShareInfo: jest.fn().mockResolvedValue({ success: true }),
      getPublicShare: jest.fn(),
      handleCallback: jest.fn(),
    };

    webdavService = {
      getFilesAtPath: jest.fn().mockResolvedValue([]),
      getDirectoryAtPath: jest.fn().mockResolvedValue([]),
      createFolder: jest.fn().mockResolvedValue({ status: 'ok' }),
    };

    thumbnailService = {
      getThumbnail: jest.fn().mockResolvedValue(Buffer.from('image')),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesharingController],
      providers: [
        { provide: FilesharingService, useValue: filesharingService },
        { provide: WebdavService, useValue: webdavService },
        { provide: ThumbnailService, useValue: thumbnailService },
      ],
    }).compile();

    controller = module.get<FilesharingController>(FilesharingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFilesAtPath', () => {
    it('should delegate to webdavService.getFilesAtPath for FILE type', async () => {
      await controller.getFilesAtPath('FILE', '/docs', 'default', undefined, 'teacher');

      expect(webdavService.getFilesAtPath).toHaveBeenCalledWith('teacher', '/docs', 'default', false);
    });

    it('should delegate to webdavService.getDirectoryAtPath for DIRECTORY type', async () => {
      await controller.getFilesAtPath('DIRECTORY', '/docs', 'default', undefined, 'teacher');

      expect(webdavService.getDirectoryAtPath).toHaveBeenCalledWith('teacher', '/docs', 'default', false);
    });
  });

  describe('createFileOrFolder', () => {
    it('should delegate to webdavService.createFolder', async () => {
      await controller.createFileOrFolder('/docs', 'default', { newPath: 'new-folder' }, 'teacher');

      expect(webdavService.createFolder).toHaveBeenCalledWith('teacher', '/docs', 'new-folder', 'default');
    });
  });

  describe('uploadFileViaWebDav', () => {
    it('should delegate to filesharingService.uploadFileViaWebDav', async () => {
      const mockReq = {} as never;
      await controller.uploadFileViaWebDav(mockReq, 'teacher', '/docs', 'file.pdf', 0, 'default');

      expect(filesharingService.uploadFileViaWebDav).toHaveBeenCalledWith(
        'teacher',
        '/docs',
        'file.pdf',
        mockReq,
        'default',
        0,
      );
    });
  });

  describe('deleteFile', () => {
    it('should delegate to filesharingService.deleteFileAtPath for FILE_SERVER target', async () => {
      await controller.deleteFile(['/docs/file.pdf'], 'fileServer' as never, 'default', 'teacher');

      expect(filesharingService.deleteFileAtPath).toHaveBeenCalledWith('teacher', ['/docs/file.pdf'], 'default');
    });
  });

  describe('moveOrRenameResource', () => {
    it('should delegate to filesharingService.moveOrRenameResources', async () => {
      const changes = [{ path: '/old.txt', newPath: '/new.txt' }];
      await controller.moveOrRenameResource(changes, 'default', 'teacher');

      expect(filesharingService.moveOrRenameResources).toHaveBeenCalledWith('teacher', changes, 'default');
    });
  });

  describe('getDownloadLink', () => {
    it('should delegate to filesharingService.fileLocation', async () => {
      await controller.getDownloadLink('/docs/file.pdf', 'file.pdf', 'default', 'teacher');

      expect(filesharingService.fileLocation).toHaveBeenCalledWith('teacher', '/docs/file.pdf', 'file.pdf', 'default');
    });
  });

  describe('getOnlyofficeToken', () => {
    it('should delegate to filesharingService.getOnlyOfficeToken', async () => {
      await controller.getOnlyofficeToken('payload' as never);

      expect(filesharingService.getOnlyOfficeToken).toHaveBeenCalledWith('payload');
    });
  });

  describe('duplicateFile', () => {
    it('should delegate to filesharingService.duplicateFile', async () => {
      const dto = { originFilePath: '/a.txt', destinationFilePaths: ['/b.txt'] };
      await controller.duplicateFile(dto as never, 'default', 'teacher');

      expect(filesharingService.duplicateFile).toHaveBeenCalledWith('teacher', dto, 'default');
    });
  });

  describe('createPublicShare', () => {
    it('should delegate to filesharingService.createPublicShare', async () => {
      const user = createJwtUser();
      const dto = { filename: 'test.pdf' };

      await controller.createPublicShare(dto as never, user);

      expect(filesharingService.createPublicShare).toHaveBeenCalledWith(user, dto);
    });
  });

  describe('listPublicShares', () => {
    it('should delegate to filesharingService.listPublicShares', async () => {
      const user = createJwtUser();

      await controller.listPublicShares(user);

      expect(filesharingService.listPublicShares).toHaveBeenCalledWith(user);
    });
  });

  describe('deletePublicShares', () => {
    it('should delegate to filesharingService.deletePublicShares', async () => {
      const shares = [{ publicShareId: 'abc' }];

      await controller.deletePublicShares(shares as never[], 'teacher');

      expect(filesharingService.deletePublicShares).toHaveBeenCalledWith('teacher', shares);
    });
  });

  describe('editPublicShare', () => {
    it('should delegate to filesharingService.editPublicShare', async () => {
      const dto = { publicShareId: 'abc' };

      await controller.editPublicShare(dto as never, 'teacher');

      expect(filesharingService.editPublicShare).toHaveBeenCalledWith('teacher', dto);
    });
  });

  describe('getPublicShareInfo', () => {
    it('should delegate to filesharingService.getPublicShareInfo', async () => {
      const user = createJwtUser();

      await controller.getPublicShareInfo('share-id', user);

      expect(filesharingService.getPublicShareInfo).toHaveBeenCalledWith('share-id', user);
    });
  });

  describe('handleCallback', () => {
    it('should return OK for status 1 (editing)', async () => {
      const mockReq = { body: { status: 1 } } as never;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.handleCallback(mockReq, mockRes, '/path', 'file.docx', 'default', 'teacher');

      expect(status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(json).toHaveBeenCalledWith({ error: 0 });
    });

    it('should delegate to filesharingService.handleCallback for other statuses', async () => {
      const mockReq = { body: { status: 2 } } as never;
      const mockRes = {} as never;

      await controller.handleCallback(mockReq, mockRes, '/path', 'file.docx', 'default', 'teacher');

      expect(filesharingService.handleCallback).toHaveBeenCalledWith(
        mockReq,
        mockRes,
        '/path',
        'file.docx',
        'teacher',
        'default',
      );
    });
  });
});
