import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Logger,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import FilesharingService from './filesharing.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller('filesharing')
class FilesharingController {
  constructor(private readonly filesharingService: FilesharingService) {}

  @Get('mountpoints')
  async getMountPoints(@GetCurrentUsername() username: string) {
    return this.filesharingService.getMountPoints(username);
  }

  @Get('files/*')
  async getFilesAtPath(@Param('0') path: string, @GetCurrentUsername() username: string) {
    Logger.log(`Getting files at path ${path}`, FilesharingController.name);
    return this.filesharingService.getFilesAtPath(username, path);
  }

  @Get('dirs/*')
  async getDirectoriesAtPath(@Param('0') path: string, @GetCurrentUsername() username: string) {
    return this.filesharingService.getDirAtPath(username, path);
  }

  @Put('createFolder')
  async createFolder(@Body() body: { path: string; folderName: string }, @GetCurrentUsername() username: string) {
    return this.filesharingService.createFolder(username, body.path, body.folderName);
  }

  @Put('createFile')
  async createFile(
    @Body() body: { path: string; fileName: string; content: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.createFile(username, body.path, body.fileName, body.content);
  }

  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('path') path: string,
    @Body('name') name: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.uploadFile(username, path, file, name);
  }

  @Delete(':filePath(*)')
  async deleteFile(@Param('filePath') filePath: string, @GetCurrentUsername() username: string) {
    return this.filesharingService.deleteFileAtPath(username, filePath);
  }

  @Put('name')
  async renameResource(@Body() body: { originPath: string; newPath: string }, @GetCurrentUsername() username: string) {
    return this.filesharingService.renameFile(username, body.originPath, body.newPath);
  }

  @Put('locations')
  async moveResource(@Body() body: { originPath: string; newPath: string }, @GetCurrentUsername() username: string) {
    return this.filesharingService.moveItems(username, body.originPath, body.newPath);
  }

  @Get('downloadLink')
  async downloadFile(
    @Query('filePath') filePath: string,
    @Query('fileName') fileName: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.downloadLink(username, filePath, fileName);
  }

  @Get('fileStream')
  @Header('Content-Type', 'application/octet-stream')
  async webDavFileStream(
    @Query('filePath') filePath: string,
    @GetCurrentUsername() username: string,
  ): Promise<StreamableFile> {
    try {
      const stream = await this.filesharingService.getWebDavFileStream(username, filePath);
      const fileName = filePath.split('/').pop(); // Extract the filename from the filePath

      return new StreamableFile(stream, {
        disposition: `attachment; filename="${fileName}"`,
      });
    } catch (error) {
      Logger.error(`Error in webDavFileStream: ${error}`);
      throw new Error('An error occurred while fetching the file stream.');
    }
  }
}

export default FilesharingController;
