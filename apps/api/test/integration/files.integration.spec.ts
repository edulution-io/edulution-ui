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

import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import FilesharingController from '../../src/filesharing/filesharing.controller';
import FilesharingService from '../../src/filesharing/filesharing.service';
import WebdavService from '../../src/webdav/webdav.service';
import ThumbnailService from '../../src/filesharing/thumbnail.service';
import { TEST_USER, MockAuthGuard, MockAccessGuard } from './createTestApp';

const BASE = `/edu-api/${FileSharingApiEndpoints.BASE}`;

describe('Filesharing Integration', () => {
  let app: INestApplication;
  let filesharingService: Record<string, jest.Mock>;
  let webdavService: Record<string, jest.Mock>;
  let thumbnailService: Record<string, jest.Mock>;

  beforeAll(async () => {
    const mockFileList = [
      { name: 'document.pdf', type: 'FILE', size: 1024, etag: 'abc123' },
      { name: 'photos', type: 'COLLECTION', size: 0, etag: 'def456' },
    ];

    webdavService = {
      getFilesAtPath: jest.fn().mockResolvedValue(mockFileList),
      getDirectoryAtPath: jest.fn().mockResolvedValue(mockFileList),
      createFolder: jest.fn().mockResolvedValue(undefined),
    };

    filesharingService = {
      uploadFileViaWebDav: jest.fn().mockResolvedValue({ success: true }),
      deleteFileAtPath: jest.fn().mockResolvedValue(undefined),
      moveOrRenameResources: jest.fn().mockResolvedValue(undefined),
      getWebDavFileStream: jest.fn().mockResolvedValue({ pipe: jest.fn() }),
      fileLocation: jest.fn().mockResolvedValue({ url: '/downloads/file.pdf' }),
      getOnlyOfficeToken: jest.fn().mockReturnValue({ token: 'only-office-token' }),
      duplicateFile: jest.fn().mockResolvedValue(undefined),
      copyFileOrFolder: jest.fn().mockResolvedValue(undefined),
      collectFiles: jest.fn().mockResolvedValue(undefined),
      createPublicShare: jest.fn().mockResolvedValue({ publicShareId: 'share-1' }),
      listPublicShares: jest.fn().mockResolvedValue([{ publicShareId: 'share-1', filename: 'doc.pdf' }]),
      deletePublicShares: jest.fn().mockResolvedValue(undefined),
      editPublicShare: jest.fn().mockResolvedValue(undefined),
      getPublicShareInfo: jest.fn().mockResolvedValue({ publicShareId: 'share-1', filename: 'doc.pdf' }),
      getPublicShare: jest.fn(),
      handleCallback: jest.fn(),
    };

    thumbnailService = {
      getThumbnail: jest.fn().mockResolvedValue(Buffer.from('thumbnail-data')),
    };

    const moduleFixture = await Test.createTestingModule({
      controllers: [FilesharingController],
      providers: [
        { provide: FilesharingService, useValue: filesharingService },
        { provide: WebdavService, useValue: webdavService },
        { provide: ThumbnailService, useValue: thumbnailService },
        { provide: APP_GUARD, useValue: new MockAuthGuard(TEST_USER) },
        { provide: APP_GUARD, useValue: new MockAccessGuard() },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('edu-api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /edu-api/filesharing - list files', () => {
    it('returns files at path for FILE type', async () => {
      const response = await request(app.getHttpServer())
        .get(BASE)
        .query({ type: 'FILE', path: '/Documents', share: 'default' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(webdavService.getFilesAtPath).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        '/Documents',
        'default',
        false,
      );
    });

    it('returns directory listing for COLLECTION type', async () => {
      const response = await request(app.getHttpServer())
        .get(BASE)
        .query({ type: 'COLLECTION', path: '/', share: 'default' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(webdavService.getDirectoryAtPath).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        '/',
        'default',
        false,
      );
    });
  });

  describe('POST /edu-api/filesharing - create folder', () => {
    it('creates a new folder', async () => {
      const response = await request(app.getHttpServer())
        .post(BASE)
        .query({ path: '/Documents', share: 'default' })
        .send({ newPath: 'New Folder' });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(webdavService.createFolder).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        '/Documents',
        'New Folder',
        'default',
      );
    });
  });

  describe('DELETE /edu-api/filesharing - delete files', () => {
    it('deletes files on file server', async () => {
      const response = await request(app.getHttpServer())
        .delete(BASE)
        .query({ target: 'fileServer', share: 'default' })
        .send({ paths: ['/Documents/old.pdf'] });

      expect(response.status).toBe(HttpStatus.OK);
      expect(filesharingService.deleteFileAtPath).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        ['/Documents/old.pdf'],
        'default',
      );
    });
  });

  describe('PATCH /edu-api/filesharing - move/rename', () => {
    it('moves or renames a resource', async () => {
      const moveDto = [{ oldPath: '/Documents/old.pdf', newPath: '/Documents/new.pdf' }];

      const response = await request(app.getHttpServer()).patch(BASE).query({ share: 'default' }).send(moveDto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(filesharingService.moveOrRenameResources).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        moveDto,
        'default',
      );
    });
  });

  describe('GET /edu-api/filesharing/file-location - download link', () => {
    it('returns a download link', async () => {
      const response = await request(app.getHttpServer())
        .get(`${BASE}/${FileSharingApiEndpoints.FILE_LOCATION}`)
        .query({ filePath: '/Documents/file.pdf', fileName: 'file.pdf', share: 'default' });

      expect(response.status).toBe(HttpStatus.OK);
      expect(filesharingService.fileLocation).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        '/Documents/file.pdf',
        'file.pdf',
        'default',
      );
    });
  });

  describe('POST /edu-api/filesharing/duplicate - duplicate file', () => {
    it('duplicates a file', async () => {
      const duplicateDto = { filePath: '/Documents/file.pdf', targetPath: '/Documents' };

      const response = await request(app.getHttpServer())
        .post(`${BASE}/${FileSharingApiEndpoints.DUPLICATE}`)
        .query({ share: 'default' })
        .send(duplicateDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(filesharingService.duplicateFile).toHaveBeenCalledWith(
        TEST_USER.preferred_username,
        duplicateDto,
        'default',
      );
    });
  });

  describe('Public share endpoints', () => {
    it('POST /edu-api/filesharing/public-share - create public share', async () => {
      const shareDto = {
        filePath: '/Documents/file.pdf',
        filename: 'file.pdf',
        etag: 'abc',
        share: 'default',
        invitedAttendees: [],
        invitedGroups: [],
      };

      const response = await request(app.getHttpServer())
        .post(`${BASE}/${FileSharingApiEndpoints.PUBLIC_SHARE}`)
        .send(shareDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(filesharingService.createPublicShare).toHaveBeenCalledWith(TEST_USER, shareDto);
    });

    it('GET /edu-api/filesharing/public-share - list public shares', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${FileSharingApiEndpoints.PUBLIC_SHARE}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(filesharingService.listPublicShares).toHaveBeenCalledWith(TEST_USER);
    });

    it('DELETE /edu-api/filesharing/public-share - delete public shares', async () => {
      const shares = [{ publicShareId: 'share-1' }];

      const response = await request(app.getHttpServer())
        .delete(`${BASE}/${FileSharingApiEndpoints.PUBLIC_SHARE}`)
        .send(shares);

      expect(response.status).toBe(HttpStatus.OK);
      expect(filesharingService.deletePublicShares).toHaveBeenCalledWith(TEST_USER.preferred_username, shares);
    });

    it('PATCH /edu-api/filesharing/public-share - edit public share', async () => {
      const shareDto = { publicShareId: 'share-1', filename: 'renamed.pdf' };

      const response = await request(app.getHttpServer())
        .patch(`${BASE}/${FileSharingApiEndpoints.PUBLIC_SHARE}`)
        .send(shareDto);

      expect(response.status).toBe(HttpStatus.OK);
      expect(filesharingService.editPublicShare).toHaveBeenCalledWith(TEST_USER.preferred_username, shareDto);
    });

    it('GET /edu-api/filesharing/public-share/:id - get public share info (public route)', async () => {
      const response = await request(app.getHttpServer()).get(
        `${BASE}/${FileSharingApiEndpoints.PUBLIC_SHARE}/share-1`,
      );

      expect(response.status).toBe(HttpStatus.OK);
      expect(filesharingService.getPublicShareInfo).toHaveBeenCalledWith('share-1', TEST_USER);
    });
  });

  describe('POST /edu-api/filesharing/only-office - OnlyOffice token', () => {
    it('returns an OnlyOffice JWT token', async () => {
      const response = await request(app.getHttpServer())
        .post(`${BASE}/${FileSharingApiEndpoints.ONLY_OFFICE_TOKEN}`)
        .send({ document: { key: 'doc-1' } });

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(filesharingService.getOnlyOfficeToken).toHaveBeenCalled();
    });
  });
});
