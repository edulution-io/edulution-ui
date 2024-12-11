import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import { GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import CustomHttpException from '@libs/error/CustomHttpException';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import { BulletinCategory, BulletinCategoryDocument } from './bulletin-category.schema';

@Injectable()
class BulletinCategoryService {
  constructor(
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getUsersWithPermissionCached(bulletinCategoryId: string, permission: 'view' | 'edit'): Promise<string[]> {
    const cacheKey = `bulletinCategory:${bulletinCategoryId}:${permission}`;
    let users = await this.cacheManager.get<string[]>(cacheKey);

    if (!users) {
      const bulletinCategory = await this.bulletinCategoryModel.findById(bulletinCategoryId).exec();
      if (!bulletinCategory) {
        throw new CustomHttpException(
          BulletinBoardErrorMessage.CATEGORY_NOT_FOUND,
          HttpStatus.NOT_FOUND,
          'Invalid ID format',
        );
      }

      const groupsToCheck =
        permission === 'edit'
          ? [...bulletinCategory.editableByGroups, ...bulletinCategory.visibleForGroups]
          : bulletinCategory.visibleForGroups;

      const usersToCheck =
        permission === 'edit'
          ? [...bulletinCategory.editableByUsers, ...bulletinCategory.visibleForUsers]
          : bulletinCategory.visibleForUsers;

      const usersInGroups = await Promise.all(
        groupsToCheck.map(async (group) => {
          const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
            `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
          );

          return groupWithMembers?.members?.map((member) => member.username) || [];
        }),
      );

      users = Array.from(new Set([...usersToCheck.map((user) => user.value), ...usersInGroups.flat()]));

      await this.cacheManager.set(cacheKey, users, DEFAULT_CACHE_TTL_MS);
    }

    return users;
  }

  async findAll(currentUser: JWTUser, isActive?: boolean): Promise<BulletinCategoryResponseDto[]> {
    const filter: Record<string, unknown> = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    const bulletinCategories: BulletinCategoryResponseDto[] = await this.bulletinCategoryModel
      .find<BulletinCategoryResponseDto>(filter)
      .exec();

    if (currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN)) {
      return bulletinCategories;
    }

    const accessibleCategories = await Promise.all(
      bulletinCategories.map(async (category) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const usersWithViewPermission = await this.getUsersWithPermissionCached(category.id, 'view');
        return usersWithViewPermission.includes(currentUser.preferred_username) ? category : null;
      }),
    );

    return accessibleCategories.filter((category) => category !== null);
  }

  async create(currentUser: JWTUser, dto: CreateBulletinCategoryDto) {
    const category = (await this.bulletinCategoryModel.create({
      name: dto.name,
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
    })) as unknown as BulletinCategoryResponseDto;

    await this.getUsersWithPermissionCached(category.id, 'view');
    await this.getUsersWithPermissionCached(category.id, 'edit');

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

    await this.getUsersWithPermissionCached(id, 'view');
    await this.getUsersWithPermissionCached(id, 'edit');
  }

  async remove(id: string): Promise<void> {
    try {
      const objectId = new Types.ObjectId(id);
      await this.bulletinCategoryModel.findById(objectId);
      await this.bulletinCategoryModel.deleteOne({ _id: objectId }).exec();
    } catch (error) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.CATEGORY_DELETE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Invalid ID format',
      );
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
