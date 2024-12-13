import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { Response } from 'express';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import APPS from '@libs/appconfig/constants/apps';
import BULLETIN_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinAttachmentsPaths';
import CustomHttpException from '@libs/error/CustomHttpException';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import BulletinBoardService from './bulletinboard.service';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import GetToken from '../common/decorators/getToken.decorator';

@ApiTags(APPS.BULLETIN_BOARD)
@ApiBearerAuth()
@Controller(APPS.BULLETIN_BOARD)
class BulletinBoardController {
  constructor(private readonly bulletinBoardService: BulletinBoardService) {}

  @Get('')
  getBulletinsByCategoryNames(@GetCurrentUser() currentUser: JWTUser, @GetToken() token: string) {
    return this.bulletinBoardService.getBulletinsByCategoryNames(currentUser, token);
  }

  @Get('bulletins')
  findAllBulletins(@GetCurrentUser() currentUser: JWTUser, @GetToken() token: string) {
    return this.bulletinBoardService.findAllBulletins(currentUser, token);
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

  @Post('files')
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
          callback(
            new CustomHttpException(BulletinBoardErrorMessage.INVALID_FILE_TYPE, HttpStatus.INTERNAL_SERVER_ERROR),
            false,
          );
        }
      },
    }),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  uploadBulletinAttachment(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const fileName = BulletinBoardService.checkAttachmentFile(file);
    return res.status(200).json(fileName);
  }
}

export default BulletinBoardController;
