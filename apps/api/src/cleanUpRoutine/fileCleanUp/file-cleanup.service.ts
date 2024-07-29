import { Injectable, Logger } from '@nestjs/common';
import { readdirSync, unlinkSync } from 'fs';
import { basename, extname, join } from 'path';

@Injectable()
class FileCleanupService {
  private readonly logger = new Logger(FileCleanupService.name);

  cleanupOldFiles(directory: string): void {
    const now = Date.now();
    const files = readdirSync(directory);

    files.forEach((file) => {
      const filePath = join(directory, file);
      const filename = basename(file, extname(file));
      const validUntilMatch = filename.match(/_valid_until(\d{14})$/);
      if (validUntilMatch) {
        const validUntilTimestamp = validUntilMatch[1];
        const validUntilDate = new Date(
          `${validUntilTimestamp.slice(0, 4)}-${validUntilTimestamp.slice(4, 6)}-${validUntilTimestamp.slice(6, 8)}T${validUntilTimestamp.slice(8, 10)}:${validUntilTimestamp.slice(10, 12)}:${validUntilTimestamp.slice(12, 14)}Z`,
        );

        if (validUntilDate.getTime() < now) {
          unlinkSync(filePath);
          this.logger.debug(`Deleted file: ${filePath}`);
        }
      }
    });
  }
}

export default FileCleanupService;
