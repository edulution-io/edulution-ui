import { Controller, Get, Param, Res, Logger } from '@nestjs/common';
import { Response } from 'express';
import { FileManagerService } from './Filemanger.service';
import { WebDAVService } from './webdav/webdav.service';

@Controller('file')
export class FilemanagerController {
  private readonly logger = new Logger(FilemanagerController.name);

  constructor(
    private fileManagerService: FileManagerService,
    private webDAVService: WebDAVService,
  ) {}

  @Get('open/*')
  async getFile(@Param('0') fullpath: string, @Res() res: Response) {
    const parts = fullpath.split('/');
    const filename = parts.pop();
    const filepath = parts.join('/');

    const fileURL = `https://server.schulung.multi.schule/webdav/${filepath}`;

    try {
      const localFilePath = await this.fileManagerService.downloadFile(
        fileURL,
        filename,
      );
      res.sendFile(localFilePath);
    } catch (error) {
      this.logger.error(
        `Failed to download or send file: ${error.message}`,
        error.stack,
      );
      res.status(500).send('Failed to process file request');
    }
  }
  @Get('getAllFiles/')
  async getAllFiles(@Res() res: Response) {
    try {
      const allFiles = await this.webDAVService.getFile('/');
      res.send(allFiles);
    } catch (error) {
      this.logger.error(
        `Failed to get all files: ${error.message}`,
        error.stack,
      );
      res.status(500).send('Failed to get all files');
    }
  }
}
