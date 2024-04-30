import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { existsSync, unlinkSync, readdirSync, rmdirSync, statSync } from 'fs';
import { join } from 'path';
import { throwError } from 'rxjs';
import { FileManagerService } from 'src/FileManager/Filemanger.service';

describe('FileDownloadService Integration Tests', () => {
  let service: FileManagerService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [FileManagerService],
    }).compile();

    service = module.get<FileManagerService>(FileManagerService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should download a file and save it to the filesystem', async () => {
    const url =
      'https://server.schulung.multi.schule/webdav/teachers/mustan/file-sample_100kB.doc';
    const filename = 'file-sample_100kB.doc';
    const outputPath = join(
      __dirname,
      '..',
      'tmp',
      'downloads',
      `${new Date().getDay()}`,
      filename,
    );
    const resultPath = await service.downloadFile(url, filename);
    expect(resultPath).toEqual(outputPath);
    expect(existsSync(outputPath)).toBeTruthy();
    unlinkSync(outputPath);
  });

  it('should handle a download failure properly', async () => {
    const url =
      'https://server.schulung.multi.schule/webdav/teachers/mustan/nonexistent_file.doc';
    const filename = 'nonexistent_file.doc';
    const outputPath = join(
      __dirname,
      '..',
      'tmp',
      'downloads',
      `${new Date().getDay()}`,
      filename,
    );
    jest
      .spyOn(httpService, 'get')
      .mockReturnValue(throwError(() => new Error('Failed to download')));
    await expect(service.downloadFile(url, filename)).rejects.toThrow(
      'Failed to download',
    );
    expect(existsSync(outputPath)).toBeFalsy();
  });

  afterEach(() => {
    const downloadDir = join(__dirname, '..', 'tmp');

    if (existsSync(downloadDir)) {
      clearDirectory(downloadDir);
    }
  });

  function clearDirectory(path) {
    const files = readdirSync(path);
    for (const file of files) {
      const curPath = join(path, file);
      if (statSync(curPath).isDirectory()) {
        clearDirectory(curPath);
      } else {
        unlinkSync(curPath);
      }
    }
    rmdirSync(path);
  }
});
