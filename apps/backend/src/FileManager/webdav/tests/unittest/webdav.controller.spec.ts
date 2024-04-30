import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import { Readable, Writable } from 'stream';
import { of } from 'rxjs';
import { join } from 'path';
import { AxiosResponse } from 'axios';
import { FileManagerService } from '../../../Filemanger.service';

jest.mock('fs');

describe('FileDownloadService', () => {
  let service: FileManagerService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [FileManagerService],
    }).compile();

    service = module.get<FileManagerService>(FileManagerService);
    httpService = module.get<HttpService>(HttpService);
    jest.clearAllMocks(); // Clear mocks in-between tests
    jest.mock('fs', () => ({
      existsSync: jest.fn(),
      mkdirSync: jest.fn(),
      createWriteStream: jest.fn(),
    }));
  });

  it('should download a file and save it to the filesystem', async () => {
    const url =
      'https://server.schulung.multi.schule/webdav/teachers/mustan/file-sample_100kB.doc';
    const filename = 'file-sample_100kB';
    const dirPath = join(
      __dirname,
      '..',
      `/tmp/downloads/${new Date().getDay()}`,
    );
    const outputPath = join(dirPath, filename);
    const testStream = new Readable();
    testStream.push('data');
    testStream.push(null);
    const mockAxiosResponse: AxiosResponse = {
      data: testStream,
      status: 200,
      statusText: 'OK',
      headers: {},
      config: {
        headers: undefined,
      },
    };
    jest.spyOn(httpService, 'get').mockReturnValue(of(mockAxiosResponse));

    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.createWriteStream as jest.Mock).mockImplementation(() => {
      const writer = new Writable();
      writer.write = jest.fn();
      writer.end = jest.fn();
      process.nextTick(() => writer.emit('finish'));
      return writer;
    });

    const result = await service.downloadFile(url, filename);
    expect(result).toEqual(outputPath);
    expect(fs.existsSync).toHaveBeenCalledWith(dirPath);
    expect(fs.mkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });
    expect(httpService.get).toHaveBeenCalledWith(url, {
      responseType: 'stream',
      auth: {
        username: 'mustan',
        password: 'Muster!',
      },
    });
    expect(fs.createWriteStream).toHaveBeenCalledWith(outputPath);
  });
});
