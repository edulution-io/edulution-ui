import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { BulletinCategory, BulletinCategoryDocument } from './bulletin-category.schema';

@Injectable()
class BulletinCategoryService {
  constructor(@InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>) {}

  async findAll(_username: string) {
    return this.bulletinCategoryModel.find().exec();
  }

  async create(currentUser: JWTUser, dto: CreateBulletinCategoryDto) {
    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    return this.bulletinCategoryModel.create({
      name: dto.name,
      isActive: dto.isActive ?? true,
      visibleForUsers: dto.visibleForUsers ?? [],
      visibleForGroups: dto.visibleForGroups ?? [],
      editableByUsers: dto.editableByUsers ?? [],
      editableByGroups: dto.editableByGroups ?? [],
      creator,
    });
  }

  async update(id: string, dto: CreateBulletinCategoryDto): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ID format: "${id}"`);
      }
      const objectId = new Types.ObjectId(id);
      const existingCategory = await this.bulletinCategoryModel.findById(objectId);
      if (!existingCategory) {
        throw new Error(`Category with ID "${id}" not found`);
      }
      Object.assign(existingCategory, dto);

      await existingCategory.save();
    } catch (error) {
      console.error(`Error updating category with ID "${id}":`, error.message);
      throw new Error(`Failed to update category: ${error.message}`);
    }
  }

  async remove(id: string): Promise<void> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid ID format: "${id}"`);
      }
      const objectId = new Types.ObjectId(id);
      const existingCategory = await this.bulletinCategoryModel.findById(objectId);
      if (!existingCategory) {
        throw new Error(`Category with ID "${id}" not found`);
      }
      await this.bulletinCategoryModel.deleteOne({ _id: objectId }).exec();
    } catch (error) {
      console.error(`Error deleting category with ID "${id}":`, error.message);
      throw new Error(`Failed to delete category: ${error.message}`);
    }
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
