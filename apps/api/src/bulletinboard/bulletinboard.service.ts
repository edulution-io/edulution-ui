import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulletinDto } from '@libs/bulletinBoard/type/bulletinDto';
import { Bulletin, BulletinDocument } from './bulletinboard.schema';

// import {BulletinCategory, BulletinCategoryDocument} from "../bulletin-category/bulletin-category.schema";

@Injectable()
class BulletinBoardService {
  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    // @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
  ) {}

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
