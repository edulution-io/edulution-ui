import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import CustomFile from '@libs/filesharing/types/customFile';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import ValidTime from '@libs/filesharing/types/validTime';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import FilesharingService from './filesharing.service';

@Controller(FileSharingApiEndpoints.BASE)
class FilesharingController {
  constructor(private readonly filesharingService: FilesharingService) {}

  @Get()
  async getFilesAtPath(
    @Query('type') type: string,
    @Query('path') path: string,
    @GetCurrentUsername() username: string,
  ) {
    if (type.toUpperCase() === ContentType.FILE.valueOf()) {
      return this.filesharingService.getFilesAtPath(username, path);
    }
    return this.filesharingService.getDirAtPath(username, path);
  }

  @Post()
  async createFileFolder(
    @Query('path') path: string,
    @Query('type') type: string,
    @Body()
    body: {
      newPath: string;
    },
    @GetCurrentUsername() username: string,
  ) {
    if (type.toUpperCase() === ContentType.DIRECTORY.toString()) {
      return this.filesharingService.createFolder(username, path, body.newPath);
    }
    return this.filesharingService.createFile(username, path, body.newPath, '');
  }

  @Put()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: CustomFile,
    @Query('path') path: string,
    @Body('name') name: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.uploadFile(username, path, file, name);
  }

  @Delete()
  async deleteFile(@Query('path') path: string, @GetCurrentUsername() username: string) {
    return this.filesharingService.deleteFileAtPath(username, path);
  }

  @Patch()
  async moveOrRenameResource(
    @Query('path') path: string,
    @Body()
    body: {
      newPath: string;
    },
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.moveOrRenameResource(username, path, body.newPath);
  }

  @Get(FileSharingApiEndpoints.GET_FILE_STREAM)
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

  @Get(FileSharingApiEndpoints.GET_DOWNLOAD_LINK)
  async getDownloadLink(
    @Query('path') filePath: string,
    @Query('newPath') newPath: string,
    @Query('validTimeSlot') validTime: ValidTime,
    @GetCurrentUsername() username: string,
  ) {
    Logger.log(`Getting download link for ${filePath} with valid time slot ${validTime}`);
    return this.filesharingService.downloadLink(username, filePath, newPath, validTime);
  }
}

export default FilesharingController;
