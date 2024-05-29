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
import * as pathNode from 'path';
import syncRequest from 'sync-request';
import * as jwt from 'jsonwebtoken';

@Controller('filemanager')
class FilemanagerController {
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

      const encodedFilename = encodeURIComponent(filename);
      const downloadLink = (process.env.EDUI_DOWNLOAD_DIR as string) + encodedFilename;
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
  @Post('callback/:path(*)/:filename/:eduToken')
  async handleCallback(
    @Req() req: Request,
    @Res() res: Response,
    @Param('path') path: string,
    @Param('filename') filename: string,
    @Param('eduToken') eduToken: string,
  ) {
    const callbackData = req.body;
    if (!callbackData || !callbackData.token) {
      return res.status(HttpStatus.BAD_REQUEST).send({ error: 1, message: 'Token is missing.' });
    }
    const secret = process.env.EDUI_ONLYOFFICE_SECRET as string;
    try {
      jwt.verify(callbackData.token, secret);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(HttpStatus.UNAUTHORIZED).send({ error: 1, message: 'Invalid token.' });
    }

    const updateFile = async (response: Response, body: any) => {
      console.log('Body:', body);

      try {
        if (body.status === 4 || body.status === 2) {
          const file = syncRequest('GET', body.url);
          console.log('File:', filename);
          const filePath = pathNode.join(__dirname, `../public/downloads/${filename}`);
          fs.mkdirSync(pathNode.dirname(filePath), { recursive: true });
          fs.writeFileSync(filePath, file.getBody());
          const fileBuffer = fs.readFileSync(filePath);

          const multerFile = {
            fieldname: 'file',
            originalname: filename,
            encoding: '7bit',
            mimetype: 'text/plain',
            buffer: fileBuffer,
            size: fileBuffer.length,
          } as Express.Multer.File;

          const uploadResult = await this.filemanagerService.uploadFile(
            eduToken,
            path.replace('/webdav/', ''),
            multerFile,
            '',
          );
          if (!uploadResult.success) {
            throw new HttpException(
              `Failed to upload the file. Server responded with status: ${uploadResult.status}`,
              HttpStatus.BAD_REQUEST,
            );
          }
        }
        console.log('File updated and uploaded successfully:', body.url, filename);
        response.status(200).send({ error: 0 });
      } catch (error) {
        console.error('Error updating file:', error);
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).send({ error: 1, message: error.message });
      }
    };

    if (Object.prototype.hasOwnProperty.call(callbackData, 'status')) {
      updateFile(res, callbackData);
    } else {
      let content = '';
      req.on('data', (data) => {
        content += data;
      });
      req.on('end', () => {
        try {
          const body = JSON.parse(content);
          updateFile(res, body);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          res.status(HttpStatus.BAD_REQUEST).send({ error: 1 });
        }
      });
    }
  }
}
export default FilemanagerController;
