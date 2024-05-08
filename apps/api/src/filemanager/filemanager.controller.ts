import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Get('fileExists/*')
  async fileExists(@Param('0') path: string) {
    return this.filemanagerService.fileExists(path);
  }

  @Post('createFolder')
  async createFolder(@Body() body: { path: string; folderName: string }) {
    try {
      const result = await this.filemanagerService.createFolder(body.path, body.folderName);
      if (!result.success) {
        throw new HttpException(
          `Failed to create the folder. Server responded with status: ${result.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('createFile')
  async createFile(@Body() body: { path: string; fileName: string; content: string }) {
    try {
      const result = await this.filemanagerService.createFile(body.path, body.fileName, body.content);
      if (!result.success) {
        throw new HttpException(
          `Failed to create the file. Server responded with status: ${result.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: File, @Body('path') path: string) {
    if (!file) throw new Error('File is required');
    try {
      return await this.filemanagerService.uploadFile(path, file);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
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

  @Put('rename')
  async renameResource(@Body() body: { path: string; newName: string }) {
    try {
      const result = await this.filemanagerService.renameFile(body.path, body.newName);
      if (!result.success) {
        throw new HttpException(
          `Failed to rename the resource. Server responded with status: ${result.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('move')
  async moveResource(@Body() body: { originPath: string; newPath: string }) {
    try {
      const result = await this.filemanagerService.moveFile(body.originPath, body.newPath);
      if (!result.success) {
        throw new HttpException(
          `Failed to move the resource. Server responded with status: ${result.status}`,
          HttpStatus.BAD_REQUEST,
        );
      }
      return result;
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('download/*')
  downloadResource(@Param('0') path: string) {
    try {
      return this.filemanagerService.downloadFile(path);
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('qrcode')
  async getQrCode() {
    try {
      return await this.filemanagerService.getQrCode();
    } catch (error) {
      throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
export default FilemanagerController;
