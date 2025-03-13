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
  HttpStatus,
  MessageEvent,
  Param,
  Patch,
  Post,
  Res,
  Sse,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { Response } from 'express';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import APPS from '@libs/appconfig/constants/apps';
import BULLETIN_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinAttachmentsPaths';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import { Observable } from 'rxjs';
import BulletinBoardService from './bulletinboard.service';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import GetToken from '../common/decorators/getToken.decorator';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@ApiTags(APPS.BULLETIN_BOARD)
@ApiBearerAuth()
@Controller(APPS.BULLETIN_BOARD)
class BulletinBoardController {
  constructor(private readonly bulletinBoardService: BulletinBoardService) {}

  @Get()
  getBulletinsByCategory(@GetCurrentUser() currentUser: JWTUser, @GetToken() token: string) {
    return this.bulletinBoardService.getBulletinsByCategory(currentUser, token);
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
  removeBulletins(@GetCurrentUser() currentUser: JWTUser, @Body() ids: string[]) {
    return this.bulletinBoardService.removeBulletins(currentUser, ids);
  }

  @Delete(':categoryId')
  removeAllBulletinsByCategory(@GetCurrentUser() currentUser: JWTUser, @Param('categoryId') categoryId: string) {
    return this.bulletinBoardService.removeAllBulletinsByCategory(currentUser, categoryId);
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
        if (IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          callback(null, true);
        } else {
          callback(
            new CustomHttpException(CommonErrorMessages.INVALID_FILE_TYPE, HttpStatus.INTERNAL_SERVER_ERROR),
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

  @Sse('sse')
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return this.bulletinBoardService.subscribe(username, res);
  }
}

export default BulletinBoardController;
