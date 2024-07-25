import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import FileSharingPaths from '@libs/filesharing/FileSharingApiEndpoints';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import FilesharingService from './filesharing.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';

@Controller(FileSharingPaths.BASE)
class FilesharingController {
  constructor(private readonly filesharingService: FilesharingService) {}

  @Get(FileSharingPaths.MOUNTPOINTS)
  async getMountPoints(@GetCurrentUsername() username: string) {
    return this.filesharingService.getMountPoints(username);
  }

  @Get(`${FileSharingPaths.FILES}*`)
  async getFilesAtPath(@Param('0') path: string, @GetCurrentUsername() username: string) {
    return this.filesharingService.getFilesAtPath(username, path);
  }

  @Get(`${FileSharingPaths.DIRECTORIES}*`)
  async getDirectoriesAtPath(@Param('0') path: string, @GetCurrentUsername() username: string) {
    return this.filesharingService.getDirAtPath(username, path);
  }

  @Post(FileSharingPaths.CREATE_FOLDER)
  async createFolder(@Body() body: { path: string; folderName: string }, @GetCurrentUsername() username: string) {
    return this.filesharingService.createFolder(username, body.path, body.folderName);
  }

  @Post(FileSharingPaths.CREATE_FILE)
  async createFile(
    @Body() body: { path: string; fileName: string; content: string },
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.createFile(username, body.path, body.fileName, body.content);
  }

  @Post(FileSharingPaths.UPLOAD_FILE)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('path') path: string,
    @Body('name') name: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.uploadFile(username, path, file, name);
  }

  @Delete(FileSharingPaths.DELETE_FILES)
  async deleteFile(@Param('filePath') filePath: string, @GetCurrentUsername() username: string) {
    return this.filesharingService.deleteFileAtPath(username, filePath);
  }

  @Put(FileSharingPaths.RENAME_RESOURCE)
  async renameResource(@Body() body: { originPath: string; newPath: string }, @GetCurrentUsername() username: string) {
    return this.filesharingService.renameFile(username, body.originPath, body.newPath);
  }

  @Put(FileSharingPaths.MOVE_RESOURCE)
  async moveResource(@Body() body: { originPath: string; newPath: string }, @GetCurrentUsername() username: string) {
    return this.filesharingService.moveItems(username, body.originPath, body.newPath);
  }

  @Get(FileSharingPaths.GET_DOWNLOAD_LINK)
  async getDownloadLink(
    @Query('filePath') filePath: string,
    @Query('fileName') fileName: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.downloadLink(username, filePath, fileName);
  }

  @Get(FileSharingPaths.FILE_STREAM)
  @Header('Content-Type', RequestResponseContentType.APPLICATION_OCET_STREAM as string)
  async webDavFileStream(
    @Query('filePath') filePath: string,
    @GetCurrentUsername() username: string,
  ): Promise<StreamableFile> {
    const stream = await this.filesharingService.getWebDavFileStream(username, filePath);
    const fileName = filePath.split('/').pop();

    return new StreamableFile(stream, {
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}

export default FilesharingController;
