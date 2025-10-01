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

import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategoryPermissionType } from '@libs/appconfig/types/bulletinCategoryPermissionType';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../common/CustomHttpException';
import { BulletinCategory, BulletinCategoryDocument } from './bulletin-category.schema';
import MigrationService from '../migration/migration.service';
import bulletinCategoryMigrationsList from './migrations/bulletinCategoryMigrationsList';

@Injectable()
class BulletinCategoryService implements OnModuleInit {
  constructor(
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    await MigrationService.runMigrations<BulletinCategoryDocument>(
      this.bulletinCategoryModel,
      bulletinCategoryMigrationsList,
    );
  }

  async getUsersWithPermissionCached(
    bulletinCategoryId: string,
    permission: BulletinCategoryPermissionType,
  ): Promise<string[]> {
    const cacheKey = `bulletinCategory:${bulletinCategoryId}:${permission}`;
    let users = await this.cacheManager.get<string[]>(cacheKey);

    if (!users || !users.length) {
      const bulletinCategory = await this.bulletinCategoryModel.findById(bulletinCategoryId).exec();
      if (!bulletinCategory) {
        throw new CustomHttpException(
          BulletinBoardErrorMessage.CATEGORY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          'Invalid ID format',
        );
      }

      const groupsToCheck =
        permission === BulletinCategoryPermission.EDIT
          ? bulletinCategory.editableByGroups
          : bulletinCategory.visibleForGroups;
      const usersToCheck =
        permission === BulletinCategoryPermission.EDIT
          ? bulletinCategory.editableByUsers
          : bulletinCategory.visibleForUsers;

      const usersInGroups = await Promise.all(
        groupsToCheck.map(async (group) => {
          const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
            `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
          );

          return groupWithMembers?.members?.map((member) => member.username) || [];
        }),
      );

      users = Array.from(new Set([...usersToCheck.map((user) => user.value), ...usersInGroups.flat()]));

      await this.cacheManager.set(cacheKey, users, DEFAULT_CACHE_TTL_MS);
    }

    return users;
  }

  async hasUserPermission(
    username: string,
    bulletinCategoryId: string,
    permission: BulletinCategoryPermissionType,
    isUserSuperAdmin = false,
  ): Promise<boolean> {
    if (isUserSuperAdmin) return true;

    const usersWithPermission = await this.getUsersWithPermissionCached(bulletinCategoryId, permission);
    return usersWithPermission.includes(username);
  }

  async findAll(
    currentUser: JWTUser,
    permission: BulletinCategoryPermissionType = BulletinCategoryPermission.VIEW,
    isActive?: boolean,
  ): Promise<BulletinCategoryResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    const bulletinCategories: BulletinCategoryResponseDto[] = await this.bulletinCategoryModel
      .find<BulletinCategoryResponseDto>(filter)
      .exec();

    if (getIsAdmin(currentUser.ldapGroups)) {
      return bulletinCategories;
    }
    const accessibleCategories = await Promise.all(
      bulletinCategories.map(async (category) => {
        const usersWithPermission = await this.getUsersWithPermissionCached(String(category.id), permission);
        return usersWithPermission.includes(currentUser.preferred_username) ? category : null;
      }),
    );

    return accessibleCategories.filter((category) => category !== null);
  }

  async create(currentUser: JWTUser, dto: CreateBulletinCategoryDto) {
    const category = (await this.bulletinCategoryModel.create({
      name: dto.name,
      bulletinVisibility: dto.bulletinVisibility,
      isActive: dto.isActive ?? true,
      visibleForUsers: dto.visibleForUsers ?? [],
      visibleForGroups: dto.visibleForGroups ?? [],
      editableByUsers: dto.editableByUsers ?? [],
      editableByGroups: dto.editableByGroups ?? [],
      creator: {
        firstName: currentUser.given_name,
        lastName: currentUser.family_name,
        username: currentUser.preferred_username,
      },
      position: dto.position,
    })) as unknown as BulletinCategoryResponseDto;

    await this.getUsersWithPermissionCached(category.id, BulletinCategoryPermission.VIEW);
    await this.getUsersWithPermissionCached(category.id, BulletinCategoryPermission.EDIT);

    return category;
  }

  async update(id: string, dto: CreateBulletinCategoryDto): Promise<void> {
    const category: BulletinCategoryDocument | null = await this.bulletinCategoryModel.findById(id).exec();
    if (!category) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.CATEGORY_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        'Invalid ID format',
      );
    }

    Object.assign(category, dto);
    await category.save();

    await this.getUsersWithPermissionCached(String(category.id), BulletinCategoryPermission.VIEW);
    await this.getUsersWithPermissionCached(String(category.id), BulletinCategoryPermission.EDIT);
  }

  async remove(id: string): Promise<void> {
    const categoryToRemove = await this.bulletinCategoryModel.findById(id).exec();
    if (!categoryToRemove) {
      throw new CustomHttpException(BulletinBoardErrorMessage.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    try {
      await this.bulletinCategoryModel.findByIdAndDelete(id).exec();

      await this.bulletinCategoryModel.updateMany(
        { position: { $gt: categoryToRemove.position } },
        { $inc: { position: -1 } },
      );
    } catch (error) {
      throw new CustomHttpException(BulletinBoardErrorMessage.CATEGORY_DELETE_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async checkIfNameExists(name: string): Promise<{ exists: boolean }> {
    const result = await this.bulletinCategoryModel.exists({ name: new RegExp(`^${name}$`, 'i') }).exec();
    const exists = !!result;
    return { exists };
  }

  async setPosition(categoryId: string, newPosition: number): Promise<boolean> {
    const category = await this.bulletinCategoryModel.findById(categoryId).exec();
    if (!category) {
      throw new CustomHttpException(BulletinBoardErrorMessage.CATEGORY_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const categoryWithSamePosition = await this.bulletinCategoryModel.findOne({ position: newPosition }).exec();

    if (!categoryWithSamePosition) {
      category.position = newPosition;
      await category.save();
      return true;
    }

    const oldPosition = category.position;
    category.position = newPosition;
    categoryWithSamePosition.position = oldPosition;
    await category.save();
    await categoryWithSamePosition.save();

    return true;
  }
}

export default BulletinCategoryService;
