import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import BulletinsByCategoryNames from '@libs/bulletinBoard/types/bulletinsByCategoryNames';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CustomHttpException from '@libs/error/CustomHttpException';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import { Bulletin, BulletinDocument } from './bulletin.schema';
import { BULLETIN_ATTACHMENTS_PATH } from './paths';

import { BulletinCategory, BulletinCategoryDocument } from '../bulletin-category/bulletin-category.schema';
import BulletinCategoryService from '../bulletin-category/bulletin-category.service';

@Injectable()
class BulletinBoardService {
  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
    private readonly bulletinCategoryService: BulletinCategoryService,
  ) {
    if (!existsSync(this.attachmentsPath)) {
      mkdirSync(this.attachmentsPath, { recursive: true });
    }
  }

  private readonly attachmentsPath = BULLETIN_ATTACHMENTS_PATH;

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  uploadBulletinAttachment(file: Express.Multer.File): string {
    if (!file) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.FILE_NOT_PROVIDED,
        HttpStatus.BAD_REQUEST,
        'No file provided.',
      );
    }

    if (!BULLETIN_BOARD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.ATTACHMENT_UPLOAD_FAILED,
        HttpStatus.BAD_REQUEST,
        'Invalid file type. Only images, audio, video, and office files are allowed.',
      );
    }

    return file.filename;
  }

  serveBulletinAttachment(filename: string, res: Response) {
    const filePath = join(this.attachmentsPath, filename);

    if (!existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'File not found' });
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);

    return res;
  }

  async getBulletinsByCategoryNames(currentUser: JwtUser, token: string): Promise<BulletinsByCategoryNames> {
    const bulletinCategories = await this.bulletinCategoryService.findAll(currentUser, true);

    const bulletins = await this.findAllBulletins(currentUser.preferred_username, token, true);

    const bulletinsByCategory: BulletinsByCategoryNames = {};

    bulletinCategories.forEach((category) => {
      bulletinsByCategory[category.name] = bulletins.filter((bulletin) => bulletin.category.id === category.id);
    });

    return bulletinsByCategory;
  }

  async findAllBulletins(
    username: string,
    token: string,
    filterOnlyActiveBulletins?: boolean,
  ): Promise<BulletinResponseDto[]> {
    const filter: Record<string, unknown> = { 'creator.username': username };

    if (filterOnlyActiveBulletins !== undefined) {
      filter.isActive = filterOnlyActiveBulletins;
    }

    const bulletins = await this.bulletinModel.find(filter).populate('category').exec();

    const currentDate = new Date();

    return bulletins
      .filter((bulletin) => {
        if (filterOnlyActiveBulletins === undefined) {
          return true;
        }
        if (!bulletin.isActive) {
          return false;
        }

        const startDate = bulletin.isVisibleStartDate ? new Date(bulletin.isVisibleStartDate) : null;
        const endDate = bulletin.isVisibleEndDate ? new Date(bulletin.isVisibleEndDate) : null;

        return (!startDate || currentDate >= startDate) && (!endDate || currentDate <= endDate);
      })
      .map(
        (bulletin) =>
          ({
            ...bulletin.toObject({ virtuals: true }),
            content: BulletinBoardService.replaceTokenPlaceholderInContent(bulletin.content, token),
          }) as unknown as BulletinResponseDto,
      );
  }

  private static replaceTokenPlaceholderInContent(content: string, token: string): string {
    return content?.replace(/token=\{\{token}}/g, `token=${token}`);
  }

  async createBulletin(currentUser: JwtUser, dto: CreateBulletinDto) {
    const category = await this.bulletinCategoryModel.findById(dto.category.id).exec();
    if (!category) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.INVALID_CATEGORY,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Invalid category',
      );
    }

    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    return this.bulletinModel.create({
      creator,
      title: dto.title,
      content: BulletinBoardService.replaceContentTokenWithPlaceholder(dto.content),
      category: new Types.ObjectId(dto.category.id),
      isVisibleStartDate: dto.isVisibleStartDate,
      isVisibleEndDate: dto.isVisibleEndDate,
    });
  }

  private static replaceContentTokenWithPlaceholder(content: string): string {
    return content.replace(/token=[^&"]+/g, 'token={{token}}');
  }

  async updateBulletin(currentUser: JwtUser, id: string, dto: CreateBulletinDto) {
    const bulletin = await this.bulletinModel.findById(id).exec();
    if (!bulletin) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.BULLETIN_NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Bulletin not found',
      );
    }

    if (bulletin.creator.username !== currentUser.preferred_username) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.UNAUTHORIZED_UPDATE_BULLETIN,
        HttpStatus.UNAUTHORIZED,
        'Unauthorized to update this bulletin',
      );
    }

    const category = await this.bulletinCategoryModel.findById(dto.category.id).exec();
    if (!category) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.INVALID_CATEGORY,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Invalid category',
      );
    }

    const updatedBy = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    bulletin.title = dto.title;
    bulletin.isActive = dto.isActive;
    bulletin.content = BulletinBoardService.replaceContentTokenWithPlaceholder(dto.content);
    bulletin.category = new Types.ObjectId(dto.category.id);
    bulletin.isVisibleStartDate = dto.isVisibleStartDate;
    bulletin.attachmentFileNames = dto.attachmentFileNames;
    bulletin.isVisibleEndDate = dto.isVisibleEndDate;
    bulletin.updatedBy = updatedBy;

    return bulletin.save();
  }

  async removeBulletin(username: string, id: string) {
    const bulletin = await this.bulletinModel.findById(id).exec();
    if (!bulletin) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.BULLETIN_NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Bulletin not found',
      );
    }

    if (bulletin.creator.username !== username) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.UNAUTHORIZED_DELETE_BULLETIN,
        HttpStatus.UNAUTHORIZED,
        'Bulletin not found',
      );
    }

    await this.bulletinModel.findByIdAndDelete(id).exec();

    return { message: 'Bulletin deleted successfully' };
  }
}

export default BulletinBoardService;
