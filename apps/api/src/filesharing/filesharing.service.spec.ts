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
    expect(service.deleteFileAtPath).toHaveBeenCalledWith(username, path);
    expect(result).toEqual({ success: true });
  });
});
