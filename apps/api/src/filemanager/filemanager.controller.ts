import { Controller, Get, Param } from '@nestjs/common';
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
}
export default FilemanagerController;
