import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { resolve } from 'path';
import FileCleanupService from './fileCleanUp/file-cleanup.service';

@Injectable()
class CleanUpRoutineService {
  private readonly logger = new Logger(CleanUpRoutineService.name);

  constructor(private readonly fileCleanupService: FileCleanupService) {}

  @Cron('45 * * * * *')
  handleCron() {
    this.logger.debug('Called when the current second is 45');
    try {
      const directory = resolve(__dirname, '..', 'public', 'downloads');
      this.fileCleanupService.cleanupOldFiles(directory);
      this.logger.debug('File cleanup completed successfully');
    } catch (error) {
      this.logger.error('File cleanup failed', error);
    }
  }
}

export default CleanUpRoutineService;
