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
  Query,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import FilemanagerService from './filemanager.service';
import GetTokenDecorator from '../common/decorators/getToken.decorator';
import OnlyofficeService from './onlyoffice/onlyoffice.service';
import { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator.ts';
import * as fs from 'fs';
import syncRequest from 'sync-request';

@Controller('filemanager')
class FilemanagerController {
  private pathForSave: './apps';
  constructor(
    private filemanagerService: FilemanagerService,
    private onlyOfficeService: OnlyofficeService,
  ) {}

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

  @Get('download')
  async downloadFile(
    @GetTokenDecorator() token: string,
    @Query('path') path: string,
    @Query('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!path || !filename) {
      throw new HttpException('Path and filename are required', HttpStatus.BAD_REQUEST);
    }

    try {
      const filePath = await this.filemanagerService.downloadFile(token, path, filename);
      if (!filePath) {
        throw new HttpException('Failed to download file', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      // Generate the download link
      const encodedFilename = encodeURIComponent(filename);
      const downloadLink = `http://localhost:3001/downloads/${encodedFilename}`;
      res.status(200).json({ downloadLink });
    } catch (error) {
      console.error('Error in downloadFile controller:', error);
      res.status(500).send('Failed to download file');
    }
  }

  @Post('oftoken')
  async getOnlyofficeToken(@GetTokenDecorator() token: string, @Body() payload: string) {
    return this.onlyOfficeService.getOnlyofficeToken(token, payload);
  }

  @Public()
  @Post('callback')
  async handleCallback(@Req() req: Request, @Res() res: Response) {
    const callbackData = req.body;
    if (!callbackData) return res.status(HttpStatus.BAD_REQUEST).send({ error: 1 });

    const updateFile = (response: Response, body: any, path: string) => {
      try {
        if (body.status === 2) {
          const file = syncRequest('GET', body.url);
          fs.writeFileSync(path, file.getBody());
        }
        response.status(HttpStatus.OK).send({ error: 0 });
      } catch (error) {
        console.error('Error updating file:', error);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: 1 });
      }
    };

    if (callbackData.hasOwnProperty('status')) {
      updateFile(res, callbackData, this.pathForSave);
    } else {
      let content = '';
      req.on('data', (data) => {
        content += data;
      });
      req.on('end', () => {
        try {
          const body = JSON.parse(content);
          updateFile(res, body, this.pathForSave);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(HttpStatus.BAD_REQUEST).send({ error: 1 });
        }
      });
    }
  }
}
export default FilemanagerController;