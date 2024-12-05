import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import { Bulletin, BulletinDocument } from './bulletin.schema';
import { BULLETIN_ATTACHMENTS_PATH } from './paths';

import { BulletinCategory, BulletinCategoryDocument } from '../bulletin-category/bulletin-category.schema';

@Injectable()
class BulletinBoardService {
  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
  ) {
    if (!existsSync(this.attachmentsPath)) {
      mkdirSync(this.attachmentsPath, { recursive: true });
    }
  }

  private readonly attachmentsPath = BULLETIN_ATTACHMENTS_PATH;

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  uploadBulletinAttachment(file: Express.Multer.File): string {
    if (!file) {
      throw new Error('No file provided.');
    }

    if (!BULLETIN_BOARD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only images, audio, video, and office files are allowed.');
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

  async findAllBulletins(username: string) {
    return this.bulletinModel.find({ 'creator.username': username, isActive: true }).populate('category').exec();
  }

  async createBulletin(currentUser: JwtUser, dto: CreateBulletinDto) {
    const category = await this.bulletinCategoryModel.findById(dto.category.id).exec();
    if (!category) {
      throw new Error('Invalid category');
    }

    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    return this.bulletinModel.create({
      creator,
      heading: dto.heading,
      content: dto.content,
      category: dto.category.id,
      isVisibleStartDate: dto.isVisibleStartDate,
      isVisibleEndDate: dto.isVisibleEndDate,
    });
  }

  async updateBulletin(_username: string, _id: string, _dto: CreateBulletinDto) {
    // Logic to update a specific bulletin board entry
  }

  async removeBulletin(_username: string, _id: string) {
    // Logic to delete a specific bulletin board entry
  }
}

export default BulletinBoardService;
