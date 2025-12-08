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
import FilesharingService from './filesharing.service';

describe('FilesharingService', () => {
  let service: FilesharingService;

  const mockFileSharingService = {
    getMountPoints: jest.fn().mockResolvedValue([{ id: '1', name: 'MountPoint1' }]),
    getFilesAtPath: jest.fn().mockResolvedValue([{ name: 'file1.txt', size: 1234 }]),
    getDirAtPath: jest.fn().mockResolvedValue([{ name: 'folder1', size: 0 }]),
    createFolder: jest.fn().mockResolvedValue({ success: true }),
    uploadFile: jest.fn().mockResolvedValue({ success: true }),
    deleteFileAtPath: jest.fn().mockResolvedValue({ success: true }),
    moveOrRenameResource: jest.fn().mockResolvedValue({ success: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FilesharingService,
        {
          provide: FilesharingService,
          useValue: mockFileSharingService,
        },
      ],
    }).compile();

    service = module.get<FilesharingService>(FilesharingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call deleteFile on FileSharingService', async () => {
    const username = 'testTeacher';
    const path = ['/test-path'];
    const result = await service.deleteFileAtPath(username, path, 'share');
    expect(service.deleteFileAtPath).toHaveBeenCalledWith(username, path, 'share');
    expect(result).toEqual({ success: true });
  });
});
