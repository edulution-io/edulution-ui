import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
  Put,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import FilemanagerService from './filemanager.service';
import GetTokenDecorator from '../common/decorators/getToken.decorator';

@Controller('filemanager')
class FilemanagerController {
  constructor(private filemanagerService: FilemanagerService) {}

  @Get('mountpoints')
  async getMountPoints(@GetTokenDecorator() token: string) {
    return this.filemanagerService.getMountPoints(token);
  }

  @Get('files/*')
  async getFilesAtPath(@GetTokenDecorator() token: string, @Param('0') path: string) {
    return this.filemanagerService.getFilesAtPath(token, path);
  }

  @Get('dirs/*')
  async getDirectoriesAtPath(@GetTokenDecorator() token: string, @Param('0') path: string) {
    return this.filemanagerService.getFoldersAtPath(token, path);
  }

  @Get('fileExists/*')
  async fileExists(@GetTokenDecorator() token: string, @Param('0') path: string) {
    return this.filemanagerService.fileExists(token, path);
  }

  @Post('createFolder')
  async createFolder(@GetTokenDecorator() token: string, @Body() body: { path: string; folderName: string }) {
    try {
      const result = await this.filemanagerService.createFolder(token, body.path, body.folderName);
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

  @Put('createfile')
  async createFile(
    @GetTokenDecorator() token: string,
    @Body() body: { path: string; fileName: string; content: string },
  ) {
    try {
      const result = await this.filemanagerService.createFile(token, body.path, body.fileName, body.content);
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
  async uploadFile(
    @GetTokenDecorator() token: string,
    @UploadedFile() file: File,
    @Body('path') path: string,
    @Body('name') name: string,
  ) {
    if (!file) throw new Error('File is required');
    try {
      return await this.filemanagerService.uploadFile(token, path, file, name);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  @Delete('delete/*')
  async deleteResource(@GetTokenDecorator() token: string, @Param('0') path: string) {
    try {
      const result = await this.filemanagerService.deleteFolder(token, path);
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
  async renameResource(@GetTokenDecorator() token: string, @Body() body: { originPath: string; newPath: string }) {
    try {
      const result = await this.filemanagerService.renameFile(token, body.originPath, body.newPath);
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
  async moveResource(@GetTokenDecorator() token: string, @Body() body: { originPath: string; newPath: string }) {
    try {
      const result = await this.filemanagerService.moveFile(token, body.originPath, body.newPath);
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
  async downloadResource(@GetTokenDecorator() token: string, @Param('0') fullpath: string, @Res() res: Response) {
    const parts = fullpath.split('/');
    const filename = parts.pop() || '';
    const filepath = parts.join('/');

    Logger.log(`Downloading file: ${filename} from path: ${filepath}`);
    const fileURL = `https://server.schulung.multi.schule/webdav/${filepath}`;

    try {
      const localFilePath = await this.filemanagerService.downloadFile(token, fileURL, filename);
      res.sendFile(localFilePath);
    } catch (error) {
      res.status(500).send('Failed to process file request');
    }
  }

  @Get('open/*')
  async getFile(@Param('0') fullpath: string, @GetTokenDecorator() token: string, @Res() res: Response) {
    const parts = fullpath.split('/');
    const filename = parts.pop() || '';
    const filepath = parts.join('/');

    const fileURL = `https://server.schulung.multi.schule/webdav/${filepath}`;

    try {
      const localFilePath = await this.filemanagerService.downloadFile(token, fileURL, filename);
      res.sendFile(localFilePath);
    } catch (error) {
      res.status(500).send('Failed to process file request');
    }
  }
}
export default FilemanagerController;
