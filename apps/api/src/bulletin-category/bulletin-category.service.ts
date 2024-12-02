import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BulletinCategoryDto } from '@libs/bulletinBoard/type/bulletinCategoryDto';
import { BulletinCategory, BulletinCategoryDocument } from './bulletin-category.schema';

@Injectable()
export class BulletinCategoryService {
  constructor(@InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>) {}

  async findAll(_username: string) {
    return this.bulletinCategoryModel.find({ isActive: true }).exec();
  }

  async create(_username: string, dto: BulletinCategoryDto) {
    return this.bulletinCategoryModel.create({
      name: dto.name,
      isActive: dto.isActive ?? true,
      visibleForUsers: dto.visibleForUsers ?? [],
      visibleForGroups: dto.visibleForGroups ?? [],
      editableByUsers: dto.editableByUsers ?? [],
      editableByGroups: dto.editableByGroups ?? [],
      createdBy: dto.createdBy,
      creationDate: new Date(),
    });
  }

  async update(_username: string, _id: string, _dto: BulletinCategoryDto) {
    // Logic to update a specific bulletin board entry
  }

  async remove(_username: string, _id: string) {
    // Logic to delete a specific bulletin board entry
  }

  async getConfigByName(name: string) {
    return this.bulletinCategoryModel.findOne({ name }).exec();
  }

  async checkIfNameExists(name: string): Promise<{ exists: boolean }> {
    const result = await this.bulletinCategoryModel.exists({ name: new RegExp(`^${name}$`, 'i') }).exec();
    const exists = !!result;
    return { exists };
  }
}

export default BulletinCategoryService;
