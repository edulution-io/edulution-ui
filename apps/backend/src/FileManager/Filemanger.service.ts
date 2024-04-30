import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FileManagerService {
  constructor(private httpService: HttpService) {}

  async downloadFile(url: string, filename: string): Promise<string> {
    const dirPath = this.ensureDownloadDir();
    const outputPath = join(dirPath, filename);

    console.log(`Attempting to download file from URL: ${url}`);
    try {
      const responseStream = await this.fetchFileStream(url);
      await this.saveFileStream(responseStream, outputPath);
      console.log(`File downloaded successfully: ${outputPath}`);
      return outputPath;
    } catch (error) {
      console.error('Failed to download file:', error);
      throw error;
    }
  }

  private ensureDownloadDir(): string {
    const dirPath = join(__dirname, `tmp/downloads/${new Date().getDay()}`);
    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }
    return dirPath;
  }

  private async fetchFileStream(url: string): Promise<WriteStream> {
    const response = this.httpService.get(url, {
      responseType: 'stream',
      auth: {
        username: 'mustan',
        password: 'Muster!',
      },
    });
    return firstValueFrom(response).then((resp) => resp.data);
  }

  private async saveFileStream(
    fileStream: WriteStream,
    outputPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const writer = createWriteStream(outputPath);
      fileStream.pipe(writer);
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
  }
}
