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

/* eslint-disable @typescript-eslint/unbound-method */

import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PassThrough, Readable } from 'stream';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import WopiController from './wopi.controller';
import CollaboraService from './collabora.service';
import WebdavService from '../webdav/webdav.service';
import WebdavSharesService from '../webdav/shares/webdav-shares.service';
import FilesystemService from '../filesystem/filesystem.service';

const MOCK_TOKEN_DATA = {
  username: 'teacher',
  filePath: '/docs/test.docx',
  share: 'default',
  origin: 'https://example.com',
  jti: 'uuid',
};

describe(WopiController.name, () => {
  let controller: WopiController;
  let collaboraService: Record<string, jest.Mock>;
  let webdavService: Record<string, jest.Mock>;
  let webdavSharesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    collaboraService = {
      validateWopiToken: jest.fn().mockResolvedValue(MOCK_TOKEN_DATA),
      getFileStat: jest.fn().mockResolvedValue({
        basename: 'test.docx',
        size: 1024,
        lastmod: '2025-01-01T00:00:00Z',
        etag: 'etag-123',
      }),
    };

    webdavService = {
      getClient: jest.fn().mockResolvedValue({}),
      uploadFile: jest.fn().mockResolvedValue({ status: 'ok' }),
    };

    webdavSharesService = {
      getWebdavShareFromCache: jest.fn().mockResolvedValue({
        pathname: '/webdav',
        url: 'https://webdav.example.com/webdav',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WopiController],
      providers: [
        { provide: CollaboraService, useValue: collaboraService },
        { provide: WebdavService, useValue: webdavService },
        { provide: WebdavSharesService, useValue: webdavSharesService },
      ],
    }).compile();

    controller = module.get<WopiController>(WopiController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkFileInfo', () => {
    it('should return file info with correct properties', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.checkFileInfo('file-id', 'valid-token', mockRes);

      expect(collaboraService.validateWopiToken).toHaveBeenCalledWith('valid-token');
      expect(collaboraService.getFileStat).toHaveBeenCalledWith('teacher', '/docs/test.docx', 'default');
      expect(status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          BaseFileName: 'test.docx',
          Size: 1024,
          OwnerId: 'teacher',
          UserId: 'teacher',
          UserCanWrite: true,
          PostMessageOrigin: 'https://example.com',
        }),
      );
    });

    it('should use fileId as fallback when filePath has no filename', async () => {
      collaboraService.validateWopiToken.mockResolvedValue({
        ...MOCK_TOKEN_DATA,
        filePath: '/',
      });
      collaboraService.getFileStat.mockResolvedValue(null);

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.checkFileInfo('fallback-id', 'valid-token', mockRes);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          BaseFileName: 'fallback-id',
          Size: 0,
        }),
      );
    });

    it('should use default values when fileStat is undefined', async () => {
      collaboraService.getFileStat.mockResolvedValue(undefined);

      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.checkFileInfo('file-id', 'valid-token', mockRes);

      const fileInfo = json.mock.calls[0][0];
      expect(fileInfo.Size).toBe(0);
      expect(fileInfo.LastModifiedTime).toBeDefined();
      expect(fileInfo.Version).toBeDefined();
      expect(fileInfo.UserCanNotWriteRelative).toBe(true);
      expect(fileInfo.UserFriendlyName).toBe('teacher');
    });

    it('should include all required WOPI properties', async () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.checkFileInfo('file-id', 'valid-token', mockRes);

      const fileInfo = json.mock.calls[0][0];
      expect(fileInfo).toEqual(
        expect.objectContaining({
          BaseFileName: 'test.docx',
          Size: 1024,
          OwnerId: 'teacher',
          UserId: 'teacher',
          UserFriendlyName: 'teacher',
          UserCanWrite: true,
          UserCanNotWriteRelative: true,
          PostMessageOrigin: 'https://example.com',
          LastModifiedTime: '2025-01-01T00:00:00Z',
          Version: 'etag-123',
        }),
      );
    });
  });

  describe('getFile', () => {
    it('should validate token and stream file with correct content type', async () => {
      const mockStream = new Readable({
        read() {
          this.push(Buffer.from('file-content'));
          this.push(null);
        },
      });

      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue(mockStream as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const writable = new PassThrough();
      const setHeader = jest.fn();
      const statusFn = jest.fn().mockReturnValue({ end: jest.fn() });

      Object.assign(writable, { setHeader, headersSent: false, status: statusFn });

      await controller.getFile('valid-token', writable as never);

      expect(collaboraService.validateWopiToken).toHaveBeenCalledWith('valid-token');
      expect(webdavService.getClient).toHaveBeenCalledWith('teacher', 'default');
      expect(setHeader).toHaveBeenCalledWith(
        HTTP_HEADERS.ContentType,
        RequestResponseContentType.APPLICATION_OCTET_STREAM,
      );
    });

    it('should handle response with data property instead of Readable', async () => {
      const mockStream = new Readable({
        read() {
          this.push(Buffer.from('file-content'));
          this.push(null);
        },
      });

      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue({ data: mockStream } as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const writable = new PassThrough();
      const setHeader = jest.fn();
      const statusFn = jest.fn().mockReturnValue({ end: jest.fn() });

      Object.assign(writable, { setHeader, headersSent: false, status: statusFn });

      await controller.getFile('valid-token', writable as never);

      expect(setHeader).toHaveBeenCalled();
    });

    it('should return 500 when pipeline fails and headers not sent', async () => {
      const errorStream = new Readable({
        read() {
          this.destroy(new Error('stream error'));
        },
      });

      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue(errorStream as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const writable = new PassThrough();
      const setHeader = jest.fn();
      const endFn = jest.fn();
      const statusFn = jest.fn().mockReturnValue({ end: endFn });

      Object.assign(writable, { setHeader, headersSent: false, status: statusFn });

      await controller.getFile('valid-token', writable as never);

      expect(statusFn).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(endFn).toHaveBeenCalled();
    });

    it('should not set status when pipeline fails and headers already sent', async () => {
      const errorStream = new Readable({
        read() {
          this.destroy(new Error('stream error'));
        },
      });

      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue(errorStream as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const writable = new PassThrough();
      const setHeader = jest.fn();
      const statusFn = jest.fn().mockReturnValue({ end: jest.fn() });

      Object.assign(writable, { setHeader, headersSent: true, status: statusFn });

      await controller.getFile('valid-token', writable as never);

      expect(statusFn).not.toHaveBeenCalled();
    });

    it('should normalize filePath without leading slash', async () => {
      collaboraService.validateWopiToken.mockResolvedValue({
        ...MOCK_TOKEN_DATA,
        filePath: 'docs/test.docx',
      });

      const mockStream = new Readable({
        read() {
          this.push(null);
        },
      });

      jest.spyOn(FilesystemService, 'fetchFileStream').mockResolvedValue(mockStream as never);
      jest.spyOn(WebdavService, 'safeJoinUrl').mockReturnValue('https://webdav.example.com/docs/test.docx');

      const writable = new PassThrough();
      const setHeader = jest.fn();
      Object.assign(writable, { setHeader, headersSent: false, status: jest.fn().mockReturnValue({ end: jest.fn() }) });

      await controller.getFile('valid-token', writable as never);

      expect(webdavSharesService.getWebdavShareFromCache).toHaveBeenCalledWith('default');
    });
  });

  describe('putFile', () => {
    it('should upload file with provided content type and return OK', async () => {
      const docxContentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      const mockReq = {
        headers: { [HTTP_HEADERS.ContentType]: docxContentType },
      } as never;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.putFile('valid-token', mockReq, mockRes);

      expect(collaboraService.validateWopiToken).toHaveBeenCalledWith('valid-token');
      expect(webdavService.uploadFile).toHaveBeenCalledWith(
        'teacher',
        expect.any(String),
        mockReq,
        'default',
        docxContentType,
      );
      expect(status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ LastModifiedTime: expect.any(String) }));
    });

    it('should use APPLICATION_OCTET_STREAM as fallback when no content-type header', async () => {
      const mockReq = { headers: {} } as never;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.putFile('valid-token', mockReq, mockRes);

      expect(webdavService.uploadFile).toHaveBeenCalledWith(
        'teacher',
        expect.any(String),
        mockReq,
        'default',
        RequestResponseContentType.APPLICATION_OCTET_STREAM,
      );
      expect(status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should return INTERNAL_SERVER_ERROR when upload fails', async () => {
      const mockReq = { headers: {} } as never;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      webdavService.uploadFile.mockRejectedValue(new Error('upload failed'));

      await controller.putFile('valid-token', mockReq, mockRes);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ LastModifiedTime: expect.any(String) }));
    });

    it('should normalize filePath without leading slash', async () => {
      collaboraService.validateWopiToken.mockResolvedValue({
        ...MOCK_TOKEN_DATA,
        filePath: 'docs/test.docx',
      });

      const mockReq = { headers: {} } as never;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });
      const mockRes = { status } as never;

      await controller.putFile('valid-token', mockReq, mockRes);

      expect(webdavSharesService.getWebdavShareFromCache).toHaveBeenCalledWith('default');
      expect(webdavService.uploadFile).toHaveBeenCalled();
      expect(status).toHaveBeenCalledWith(HttpStatus.OK);
    });
  });
});
