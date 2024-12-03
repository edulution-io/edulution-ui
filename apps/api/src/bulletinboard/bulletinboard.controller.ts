import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CreateBulletinDto from '@libs/bulletinBoard/type/createBulletinDto';
import { Response } from 'express';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';
import BulletinBoardService from './bulletinboard.service';
import { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import { BULLETIN_ATTACHMENTS_PATH } from './paths';

@ApiTags('bulletinboard')
@ApiBearerAuth()
@Controller('bulletinboard')
class BulletinBoardController {
  constructor(private readonly bulletinBoardService: BulletinBoardService) {}

  @Get()
  findAllBulletins(@GetCurrentUsername() currentUsername: string) {
    return this.bulletinBoardService.findAllBulletins(currentUsername);
  }

  @Post()
  createBulletin(@GetCurrentUsername() currentUsername: string, @Body() bulletin: CreateBulletinDto) {
    return this.bulletinBoardService.createBulletin(currentUsername, bulletin);
  }

  @Patch(':id')
  updateBulletin(
    @GetCurrentUsername() currentUsername: string,
    @Param('id') id: string,
    @Body() bulletin: CreateBulletinDto,
  ) {
    return this.bulletinBoardService.updateBulletin(currentUsername, id, bulletin);
  }

  @Delete(':id')
  removeBulletin(@GetCurrentUsername() currentUsername: string, @Param('id') id: string) {
    return this.bulletinBoardService.removeBulletin(currentUsername, id);
  }

  @Get('attachments/:filename')
  serveBulletinAttachment(@Param('filename') filename: string, @Res() res: Response) {
    return this.bulletinBoardService.serveBulletinAttachment(filename, res);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: BULLETIN_ATTACHMENTS_PATH,
        filename: (_req, file, callback) => {
          const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
          callback(null, uniqueFilename);
        },
      }),
      fileFilter: (_req, file, callback) => {
        if (BULLETIN_BOARD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(new Error('Invalid file type. Only images, audio, video, and office files are allowed.'), false);
        }
      },
    }),
  )
  uploadBulletinAttachment(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const result = this.bulletinBoardService.uploadBulletinAttachment(file);
    return res.status(200).json({
      message: 'File uploaded successfully.',
      filename: result.filename,
      path: result.path,
    });
  }
}

export default BulletinBoardController;
