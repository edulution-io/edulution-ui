import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';
import { BulletinCategory, BulletinCategoryDocument } from './bulletin-category.schema';

@Injectable()
export class BulletinCategoryService {
  constructor(@InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>) {}

  async findAll(username: string) {
    const bulletinCategories = await this.bulletinCategoryModel.find({ isActive: true }).exec();

    return bulletinCategories;
  }

  async create(username: string, dto: BulletinCategoryDto) {
    const newBulletinCategory = await this.bulletinCategoryModel.create({
      name: dto.name,
      isActive: dto.isActive,
      visibleByUsers: dto.visibleByUsers,
      editableByUsers: dto.editableByUsers,
    });

    return newBulletinCategory;
  }

  async update(username: string, id: string, dto: BulletinCategoryDto) {
    // Logic to update a specific bulletin board entry
  }

  async remove(username: string, id: string) {
    // Logic to delete a specific bulletin board entry
  }
}

export default BulletinCategoryService;
