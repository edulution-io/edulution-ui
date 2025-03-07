/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpStatus,
  Logger,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import CustomFile from '@libs/filesharing/types/customFile';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { Request, Response } from 'express';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import FilesharingService from './filesharing.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@ApiTags(FileSharingApiEndpoints.BASE)
@ApiBearerAuth()
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
  async deleteFile(
    @Query('path') path: string,
    @Query('target') target: DeleteTargetType,
    @GetCurrentUsername() username: string,
  ) {
    if (target === DeleteTargetType.FILE_SERVER) {
      return this.filesharingService.deleteFileAtPath(username, path);
    }
    return FilesharingService.deleteFileFromServer(path);
  }

  @Patch()
  async moveOrRenameResource(
    @Body()
    body: {
      path: string;
      newPath: string;
    },
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.moveOrRenameResource(username, body.path, body.newPath);
  }

  @Get(FileSharingApiEndpoints.FILE_STREAM)
  @Header('Content-Type', RequestResponseContentType.APPLICATION_OCTET_STREAM as string)
  async webDavFileStream(
    @Query('filePath') filePath: string,
    @Res() res: Response,
    @GetCurrentUsername() username: string,
  ) {
    const stream = await this.filesharingService.getWebDavFileStream(username, filePath);

    stream.on('error', (err) => {
      if (err.message !== 'Premature close') {
        Logger.error(`${FilesharingController.name}: Unknown stream error:`, err);
      }
    });

    const fileName = filePath.split('/').pop();

    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    stream.pipe(res);
  }

  @Get(FileSharingApiEndpoints.FILE_LOCATION)
  async getDownloadLink(
    @Query('filePath') filePath: string,
    @Query('fileName') fileName: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.fileLocation(username, filePath, fileName);
  }

  @Post(FileSharingApiEndpoints.ONLY_OFFICE_TOKEN)
  getOnlyofficeToken(@Body() payload: string) {
    return this.filesharingService.getOnlyOfficeToken(payload);
  }

  @Post(FileSharingApiEndpoints.DUPLICATE)
  async duplicateFile(
    @Body() duplicateFileRequestDto: DuplicateFileRequestDto,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.duplicateFile(username, duplicateFileRequestDto);
  }

  @Post(FileSharingApiEndpoints.COLLECT)
  async collectFiles(
    @Body() body: { collectFileRequestDTO: CollectFileRequestDTO[] },
    @Query('type') type: LmnApiCollectOperationsType,
    @Query('userRole') userRole: string,
    @GetCurrentUsername() username: string,
  ) {
    const { collectFileRequestDTO } = body;
    return this.filesharingService.collectFiles(username, collectFileRequestDTO, userRole, type);
  }

  @Post('callback')
  async handleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('path') path: string,
    @Query('filename') filename: string,
    @GetCurrentUsername() username: string,
  ) {
    try {
      const { status } = req.body as OnlyOfficeCallbackData;
      if (status === 1) {
        return res.status(HttpStatus.OK).json({ error: 0 });
      }

      return await this.filesharingService.handleCallback(req, res, path, filename, username);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 1 });
    }
  }
}

export default FilesharingController;
