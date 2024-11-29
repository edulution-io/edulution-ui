import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulletinDto } from '@libs/bulletinBoard/type/bulletinDto';
import { Bulletin, BulletinDocument } from './bulletinboard.schema';
import { BulletinCategory, BulletinCategoryDocument } from './bulletin-category.schema';

@Injectable()
export class BulletinBoardService {
  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
  ) {}

  async findAll(username: string) {
    const bulletins = await this.bulletinModel.find({ isActive: true }).populate('category').exec();

    return bulletins;
  }

  async create(username: string, dto: BulletinDto) {
    const newBulletin = await this.bulletinModel.create({
      creator: dto.creator,
      heading: dto.heading,
      content: dto.content,
      category: dto.category,
      isVisibleStartDate: dto.isVisibleStartDate,
      isVisibleEndDate: dto.isVisibleEndDate,
    });

    return newBulletin;
  }

  async update(username: string, id: string, dto: BulletinDto) {
    // Logic to update a specific bulletin board entry
  }

  async remove(username: string, id: string) {
    // Logic to delete a specific bulletin board entry
  }
}

export default BulletinBoardService;
