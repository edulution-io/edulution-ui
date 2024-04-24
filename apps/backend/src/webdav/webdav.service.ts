import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FileDownloadService {
  constructor(private httpService: HttpService) {}

  getHello() {
    return 'HEY FILEDOWNLOADSERVICE';
  }

  async downloadFile(url: string, filename: string): Promise<string> {
    const dirPath = join(__dirname, '..', 'downloads');
    if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
    }
    const outputPath = join(dirPath, filename);

    console.log(`Attempting to download file from URL: ${url}`);
    const response$ = this.httpService.get(url, {
        responseType: 'stream',
        auth: {
            username: 'mustan',  // Ensure these are secured
            password: 'Muster!',
        },
    });

    try {
        const response = await firstValueFrom(response$);
        return new Promise((resolve, reject) => {
            const writer = createWriteStream(outputPath);
            response.data.pipe(writer);
            writer.on('finish', () => {
                console.log(`File downloaded successfully: ${outputPath}`);
                resolve(outputPath);
            });
            writer.on('error', (error) => {
                console.error('Error writing file:', error);
                reject(error);
            });
        });
    } catch (error) {
        console.error('Failed to download file:', error);
        throw error;
    }
}

}
