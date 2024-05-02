import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
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

  @Delete('delete/*')
  async deleteResource(@Param('0') path: string) {
    try {
      const result = await this.filemanagerService.deleteFolder(path);
      if (!result.success) {
        throw new HttpException(
          `Failed to delete the resource. Server responded with status: ${result.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
export default FilemanagerController;
