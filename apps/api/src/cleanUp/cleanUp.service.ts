import { Injectable } from '@nestjs/common';
import { resolve } from 'path';
import { remove } from 'fs-extra';

@Injectable()
class CleanUpService {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async cleanUpDownloads(fileName: string): Promise<void> {
    const outputFolder = resolve(__dirname, '..', 'public', 'downloads');
    const filePath = resolve(outputFolder, fileName);
    try {
      await remove(filePath);
    } catch (error) {
      console.error(`Error deleting file ${fileName}:`, error);
      throw new Error(`Could not delete file: ${fileName}`);
    }
  }
}

export default CleanUpService;
