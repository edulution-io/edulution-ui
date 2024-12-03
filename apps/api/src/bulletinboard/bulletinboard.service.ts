import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model } from 'mongoose';
import { BulletinDto } from '@libs/bulletinBoard/type/bulletinDto';
import { join } from 'path';
import { createReadStream, existsSync, mkdirSync } from 'fs';
import BULLETIN_BOARD_ALLOWED_MIME_TYPES from '@libs/bulletinBoard/constants/allowedMimeTypes';
import { Bulletin, BulletinDocument } from './bulletinboard.schema';
import { BULLETIN_ATTACHMENTS_PATH } from './paths';

// import {BulletinCategory, BulletinCategoryDocument} from "../bulletin-category/bulletin-category.schema";

@Injectable()
class BulletinBoardService {
  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    // @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
  ) {
    if (!existsSync(this.attachmentsPath)) {
      mkdirSync(this.attachmentsPath, { recursive: true });
    }
  }

  private readonly attachmentsPath = BULLETIN_ATTACHMENTS_PATH;

  uploadFile(file: Express.Multer.File): { filename: string; path: string } {
    if (!file) {
      throw new Error('No file provided.');
    }

    if (!BULLETIN_BOARD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new Error('Invalid file type. Only images, audio, video, and office files are allowed.');
    }

    return {
      filename: file.filename,
      path: `${this.attachmentsPath}/${file.filename}`,
    };
  }

  serveFile(filename: string, res: Response) {
    const filePath = join(this.attachmentsPath, filename);

    if (!existsSync(filePath)) {
      return res.status(HttpStatus.NOT_FOUND).json({ message: 'File not found' });
    }

    const fileStream = createReadStream(filePath);
    fileStream.pipe(res);

    return res;
  }

  async findAll(_username: string) {
    return this.bulletinModel.find({ isActive: true }).populate('category').exec();
  }

  async create(_username: string, dto: BulletinDto) {
    return this.bulletinModel.create({
      creator: dto.creator,
      heading: dto.heading,
      content: dto.content,
      category: dto.category,
      isVisibleStartDate: dto.isVisibleStartDate,
      isVisibleEndDate: dto.isVisibleEndDate,
    });
  }

  async update(_username: string, _id: string, _dto: BulletinDto) {
    // Logic to update a specific bulletin board entry
  }

  async remove(_username: string, _id: string) {
    // Logic to delete a specific bulletin board entry
  }
}

export default BulletinBoardService;
