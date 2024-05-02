import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import FilemanagerService from './filemanager.service';

@Controller('filemanager')
class FilemanagerController {
  constructor(private filemanagerService: FilemanagerService) {}

  @Get('mountpoints')
  async getMountPoints() {
    return this.filemanagerService.getMountPoints();
  }

  @Get('files/*')
  async getFilesAtPath(@Param('0') path: string) {
    console.log('path:', path);
    return this.filemanagerService.getFilesAtPath(`${path}`);
  }

  @Post('create')
  async createFolder(@Body() body: { path: string; folderName: string }) {
    return this.filemanagerService.createFolder(body.path, body.folderName);
  }
}
export default FilemanagerController;
