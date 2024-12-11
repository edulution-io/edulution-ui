import { Body, Controller, Delete, Get, Param, Patch, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { Response } from 'express';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import BulletinBoardService from './bulletinboard.service';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import { BULLETIN_ATTACHMENTS_PATH } from './paths';
import GetToken from '../common/decorators/getToken.decorator';

@ApiTags('bulletinboard')
@ApiBearerAuth()
@Controller('bulletinboard')
class BulletinBoardController {
  constructor(private readonly bulletinBoardService: BulletinBoardService) {}

  @Get('')
  getBulletinsByCategory(@GetCurrentUser() currentUser: JWTUser, @GetToken() token: string) {
    return this.bulletinBoardService.getBulletinsByCategory(currentUser, token);
  }

  @Get('bulletins')
  findAllBulletins(@GetCurrentUsername() currentUsername: string, @GetToken() token: string) {
    return this.bulletinBoardService.findAllBulletins(currentUsername, token);
  }

  @Post()
  createBulletin(@GetCurrentUser() currentUser: JWTUser, @Body() bulletin: CreateBulletinDto) {
    return this.bulletinBoardService.createBulletin(currentUser, bulletin);
  }

  @Patch(':id')
  updateBulletin(@GetCurrentUser() currentUser: JWTUser, @Param('id') id: string, @Body() bulletin: CreateBulletinDto) {
    return this.bulletinBoardService.updateBulletin(currentUser, id, bulletin);
  }

  @Delete()
  removeBulletins(@GetCurrentUsername() currentUsername: string, @Body() ids: string[]) {
    return this.bulletinBoardService.removeBulletins(currentUsername, ids);
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
    const fileName = this.bulletinBoardService.uploadBulletinAttachment(file);
    return res.status(200).json(fileName);
  }
}

export default BulletinBoardController;
