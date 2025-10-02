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
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { Request, Response } from 'express';
import DeleteTargetType from '@libs/filesharing/types/deleteTargetType';
import OnlyOfficeCallbackData from '@libs/filesharing/types/onlyOfficeCallBackData';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import { LmnApiCollectOperationsType } from '@libs/lmnApi/types/lmnApiCollectOperationsType';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import DuplicateFileRequestDto from '@libs/filesharing/types/DuplicateFileRequestDto';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';
import CreateOrEditPublicShareDto from '@libs/filesharing/types/createOrEditPublicShareDto';
import PublicShareDto from '@libs/filesharing/types/publicShareDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { pipeline } from 'stream/promises';
import { basename } from 'path';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import FilesystemService from '../filesystem/filesystem.service';
import FilesharingService from './filesharing.service';
import WebdavService from '../webdav/webdav.service';
import { Public } from '../common/decorators/public.decorator';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';

@ApiTags(FileSharingApiEndpoints.BASE)
@ApiBearerAuth()
@Controller(FileSharingApiEndpoints.BASE)
class FilesharingController {
  constructor(
    private readonly filesharingService: FilesharingService,
    private readonly webdavService: WebdavService,
  ) {}

  @Get()
  async getFilesAtPath(
    @Query('type') type: string,
    @Query('path') path: string,
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    if (type.toUpperCase() === ContentType.FILE.valueOf()) {
      return this.webdavService.getFilesAtPath(username, path, share);
    }
    return this.webdavService.getDirectoryAtPath(username, path, share);
  }

  @Post()
  async createFileOrFolder(
    @Query('path') path: string,
    @Query('share') share: string,
    @Body()
    body: {
      newPath: string;
    },
    @GetCurrentUsername() username: string,
  ) {
    return this.webdavService.createFolder(username, path, body.newPath, share);
  }

  @Post(FileSharingApiEndpoints.UPLOAD)
  async uploadFileViaWebDav(
    @Req() req: Request,
    @GetCurrentUsername() username: string,
    @Query('path') path: string,
    @Query('name') name: string,
    @Query('contentLength', new DefaultValuePipe(0), ParseIntPipe) contentLength: number,
    @Query('share') share: string,
  ) {
    return this.filesharingService.uploadFileViaWebDav(username, path, name, req, share, contentLength);
  }

  @Delete()
  async deleteFile(
    @Body('paths') paths: string[],
    @Query('target') target: DeleteTargetType,
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    if (target === DeleteTargetType.FILE_SERVER) {
      return this.filesharingService.deleteFileAtPath(username, paths, share);
    }
    return FilesystemService.deleteFiles(PUBLIC_DOWNLOADS_PATH, paths);
  }

  @Patch()
  async moveOrRenameResource(
    @Body() pathChangeOrCreateDtos: PathChangeOrCreateDto[],
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.moveOrRenameResources(username, pathChangeOrCreateDtos, share);
  }

  @Get(FileSharingApiEndpoints.FILE_STREAM)
  async webDavFileStream(
    @Query('filePath') filePath: string,
    @Query('share') share: string,
    @Res() res: Response,
    @GetCurrentUsername() username: string,
  ) {
    const stream = await this.filesharingService.getWebDavFileStream(username, filePath, share);

    const decodedPath = (() => {
      try {
        return decodeURIComponent(filePath);
      } catch {
        return filePath;
      }
    })();
    const rawName = basename(decodedPath || '');
    const safeName = rawName.replace(/[\r\n]/g, '').replace(/[\\/]/g, '');

    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_OCTET_STREAM);
    res.attachment(safeName);

    try {
      await pipeline(stream, res);
    } catch (error) {
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error while streaming file',
          details: (error as Error).message,
        });
      } else {
        res.end();
      }
    }
  }

  @Get(FileSharingApiEndpoints.FILE_LOCATION)
  async getDownloadLink(
    @Query('filePath') filePath: string,
    @Query('fileName') fileName: string,
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.fileLocation(username, filePath, fileName, share);
  }

  @Post(FileSharingApiEndpoints.ONLY_OFFICE_TOKEN)
  getOnlyofficeToken(@Body() payload: string) {
    return this.filesharingService.getOnlyOfficeToken(payload);
  }

  @Post(FileSharingApiEndpoints.DUPLICATE)
  async duplicateFile(
    @Body() duplicateFileRequestDto: DuplicateFileRequestDto,
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.duplicateFile(username, duplicateFileRequestDto, share);
  }

  @Post(FileSharingApiEndpoints.COPY)
  async copyFile(
    @Body() pathChangeOrCreateDto: PathChangeOrCreateDto[],
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    return this.filesharingService.copyFileOrFolder(username, pathChangeOrCreateDto, share);
  }

  @Post(FileSharingApiEndpoints.COLLECT)
  async collectFiles(
    @Body() body: { collectFileRequestDTO: CollectFileRequestDTO[] },
    @Query('type') type: LmnApiCollectOperationsType,
    @Query('userRole') userRole: string,
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    const { collectFileRequestDTO } = body;
    return this.filesharingService.collectFiles(username, collectFileRequestDTO, userRole, type, share);
  }

  @Post(FileSharingApiEndpoints.PUBLIC_SHARE)
  async createPublicShare(
    @Body() createPublicFileShareDto: CreateOrEditPublicShareDto,
    @GetCurrentUser() currentUser: JWTUser,
  ) {
    return this.filesharingService.createPublicShare(currentUser, createPublicFileShareDto);
  }

  @Get(FileSharingApiEndpoints.PUBLIC_SHARE)
  async listOwnPublicShares(@GetCurrentUsername() username: string) {
    return this.filesharingService.listOwnPublicShares(username);
  }

  @Post('callback')
  async handleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Query('path') path: string,
    @Query('filename') filename: string,
    @Query('share') share: string,
    @GetCurrentUsername() username: string,
  ) {
    try {
      const { status } = req.body as OnlyOfficeCallbackData;
      if (status === 1) {
        return res.status(HttpStatus.OK).json({ error: 0 });
      }

      return await this.filesharingService.handleCallback(req, res, path, filename, username, share);
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 1 });
    }
  }

  @Delete(FileSharingApiEndpoints.PUBLIC_SHARE)
  async deletePublicShares(@Body() publicFiles: PublicShareDto[], @GetCurrentUsername() username: string) {
    return this.filesharingService.deletePublicShares(username, publicFiles);
  }

  @Patch(FileSharingApiEndpoints.PUBLIC_SHARE)
  async editPublicShare(@Body() publicFileShareDto: PublicShareDto, @GetCurrentUsername() username: string) {
    return this.filesharingService.editPublicShare(username, publicFileShareDto);
  }

  @Public()
  @Get(`${FileSharingApiEndpoints.PUBLIC_SHARE}/:publicShareId`)
  async getPublicShareInfo(
    @Param('publicShareId') publicShareId: string,
    @GetCurrentUser({ required: false }) currentUser?: JWTUser,
  ) {
    return this.filesharingService.getPublicShareInfo(publicShareId, currentUser);
  }

  @Public()
  @Post(`${FileSharingApiEndpoints.PUBLIC_SHARE_DOWNLOAD}/:publicShareId`)
  async downloadSharedContent(
    @Param('publicShareId') publicShareId: string,
    @Query('share') share: string,
    @Body('password') password: string | undefined,
    @Res({ passthrough: true }) res: Response,
    @GetCurrentUser({ required: false }) currentUser?: JWTUser,
  ) {
    const { stream, filename, fileType } = await this.filesharingService.getPublicShare(
      publicShareId,
      currentUser,
      share,
      password,
    );

    res.set({
      [HTTP_HEADERS.ContentDisposition]: `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      [HTTP_HEADERS.ContentType]:
        fileType === ContentType.FILE
          ? RequestResponseContentType.APPLICATION_OCTET_STREAM
          : RequestResponseContentType.APPLICATION_ZIP,
    });

    return new StreamableFile(stream);
  }
}

export default FilesharingController;
