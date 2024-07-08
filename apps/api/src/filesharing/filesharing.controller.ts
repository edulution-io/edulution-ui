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
import FilesharingService from './filesharing.service';
import GetTokenDecorator from '../common/decorators/getToken.decorator';

@Controller('filesharing')
class FilesharingController {
  constructor(private readonly filesharingService: FilesharingService) {}

  @Get('mountpoints')
  async getMountPoints(@GetTokenDecorator() token: string) {
    return this.filesharingService.getMountPoints(token);
  }

  @Get('files/*')
  async getFilesAtPath(@GetTokenDecorator() token: string, @Param('0') path: string) {
    return this.filesharingService.getFilesAtPath(token, path);
  }

  @Get('dirs/*')
  async getDirectoriesAtPath(@GetTokenDecorator() token: string, @Param('0') path: string) {
    return this.filesharingService.getFoldersAtPath(token, path);
  }

  @Post('createFolder')
  async createFolder(@GetTokenDecorator() token: string, @Body() body: { path: string; folderName: string }) {
    try {
      const result = await this.filesharingService.createFolder(token, body.path, body.folderName);
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
      const result = await this.filesharingService.createFile(token, body.path, body.fileName, body.content);
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

  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @GetTokenDecorator() token: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('path') path: string,
    @Body('name') name: string,
  ) {
    if (!file) throw new Error('File is required');
    try {
      return await this.filesharingService.uploadFile(token, path, file, name);
    } catch (error) {
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  @Delete('delete/*')
  async deleteResource(@GetTokenDecorator() token: string, @Param('0') path: string) {
    try {
      const decodedPath = decodeURIComponent(path);
      const result = await this.filesharingService.deleteFolder(token, decodedPath);
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
      const result = await this.filesharingService.renameFile(token, body.originPath, body.newPath);
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
      const result = await this.filesharingService.moveFile(token, body.originPath, body.newPath);
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
}

export default FilesharingController;
