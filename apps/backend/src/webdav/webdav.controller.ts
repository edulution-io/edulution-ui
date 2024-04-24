import { Controller, Get, Res, Param } from '@nestjs/common';
import { Response } from 'express';
import {FileDownloadService} from "./webdav.service";

@Controller('file')
export class FileDownloadController {
  constructor(private fileDownloadService: FileDownloadService) {}
  @Get('open/*')
  async getFile(@Param('0') fullpath: string, @Res() res: Response) {
    const parts = fullpath.split('/');
    const filename = parts.pop();
    const filepath = parts.join('/');

    try {
      const fileURL = `https://server.schulung.multi.schule/webdav/${filepath}`;
      const localFilePath = await this.fileDownloadService.downloadFile(
        fileURL,
        filename,
      );
      res.sendFile(localFilePath);
    } catch (error) {
      console.error('Failed to download or send file:', error);
      res.status(500).send('Failed to process file request');
    }
  }
}
