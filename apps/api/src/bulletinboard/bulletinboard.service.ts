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

import { HttpStatus, Injectable, MessageEvent, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { join } from 'path';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import BulletinsByCategories from '@libs/bulletinBoard/types/bulletinsByCategories';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import CustomHttpException from '@libs/error/CustomHttpException';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import BULLETIN_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinAttachmentsPaths';
import { Observable } from 'rxjs';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { Bulletin, BulletinDocument } from './bulletin.schema';

import { BulletinCategory, BulletinCategoryDocument } from '../bulletin-category/bulletin-category.schema';
import BulletinCategoryService from '../bulletin-category/bulletin-category.service';
import SseService from '../sse/sse.service';
import type UserConnections from '../types/userConnections';
import GroupsService from '../groups/groups.service';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class BulletinBoardService implements OnModuleInit {
  private bulletinsSseConnections: UserConnections = new Map();

  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
    private readonly bulletinCategoryService: BulletinCategoryService,
    private fileSystemService: FilesystemService,
    private readonly groupsService: GroupsService,
  ) {}

  private readonly attachmentsPath = BULLETIN_ATTACHMENTS_PATH;

  onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(this.attachmentsPath);
  }

  subscribe(username: string, res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.bulletinsSseConnections, res);
  }

  async serveBulletinAttachment(filename: string, res: Response) {
    const filePath = join(this.attachmentsPath, filename);

    await FilesystemService.throwErrorIfFileNotExists(filePath);
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);

    return res;
  }

  async removeAllBulletinsByCategory(currentUser: JwtUser, categoryId: string): Promise<void> {
    const bulletins = await this.bulletinModel
      .find<BulletinResponseDto>({ category: new Types.ObjectId(categoryId) })
      .exec();

    if (!bulletins.length) {
      return;
    }

    const bulletinIds = bulletins.map((bulletin) => bulletin.id);

    await this.removeBulletins(currentUser, bulletinIds);
  }

  async getBulletinsByCategory(currentUser: JwtUser, token: string): Promise<BulletinsByCategories> {
    const bulletinCategoriesWithViewPermission: BulletinCategoryResponseDto[] =
      await this.bulletinCategoryService.findAll(currentUser, BulletinCategoryPermission.VIEW, true);

    const bulletinCategoriesWithEditPermission: BulletinCategoryResponseDto[] =
      await this.bulletinCategoryService.findAll(currentUser, BulletinCategoryPermission.EDIT, true);

    const bulletins = await this.findAllBulletins(currentUser, token, true);

    const mergedCategories = [
      ...new Map(
        [...bulletinCategoriesWithViewPermission, ...bulletinCategoriesWithEditPermission].map((category) => [
          category.id,
          category,
        ]),
      ).values(),
    ];

    return mergedCategories.map((category) => ({
      category,
      canEditCategory: bulletinCategoriesWithEditPermission.some((editCategory) => editCategory.id === category.id),
      bulletins: bulletins.filter((bulletin) => bulletin.category.id === category.id),
    }));
  }

  async findAllBulletins(
    currentUser: JwtUser,
    token: string,
    filterOnlyActiveBulletins?: boolean,
  ): Promise<BulletinResponseDto[]> {
    const filter: Record<string, unknown> = {};

    if (filterOnlyActiveBulletins !== undefined) {
      filter.isActive = filterOnlyActiveBulletins;
    } else if (!currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN)) {
      filter['creator.username'] = currentUser.preferred_username;
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
      throw new CustomHttpException(BulletinBoardErrorMessage.INVALID_CATEGORY, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const hasUserPermission = await this.bulletinCategoryService.hasUserPermission(
      currentUser.preferred_username,
      dto.category.id,
      BulletinCategoryPermission.EDIT,
      currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN),
    );
    if (!hasUserPermission) {
      throw new CustomHttpException(BulletinBoardErrorMessage.UNAUTHORIZED_CREATE_BULLETIN, HttpStatus.FORBIDDEN);
    }

    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    const createdBulletin = await this.bulletinModel.create({
      creator,
      title: dto.title,
      attachmentFileNames: dto.attachmentFileNames,
      content: BulletinBoardService.replaceContentTokenWithPlaceholder(dto.content),
      category: new Types.ObjectId(dto.category.id),
      isVisibleStartDate: dto.isVisibleStartDate,
      isVisibleEndDate: dto.isVisibleEndDate,
    });

    await this.notifyUsers(dto, createdBulletin);

    return createdBulletin;
  }

  private static replaceContentTokenWithPlaceholder(content: string): string {
    return content.replace(/token=[^&"]+/g, 'token={{token}}');
  }

  async updateBulletin(currentUser: JwtUser, id: string, dto: CreateBulletinDto) {
    const bulletin = await this.bulletinModel.findById(id).exec();
    if (!bulletin) {
      throw new CustomHttpException(BulletinBoardErrorMessage.BULLETIN_NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const isUserSuperAdmin = currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN);
    if (bulletin.creator.username !== currentUser.preferred_username && !isUserSuperAdmin) {
      throw new CustomHttpException(BulletinBoardErrorMessage.UNAUTHORIZED_UPDATE_BULLETIN, HttpStatus.UNAUTHORIZED);
    }

    const category = await this.bulletinCategoryModel.findById(dto.category.id).exec();
    if (!category) {
      throw new CustomHttpException(BulletinBoardErrorMessage.INVALID_CATEGORY, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const hasUserPermissionToCategory = await this.bulletinCategoryService.hasUserPermission(
      currentUser.preferred_username,
      dto.category.id,
      BulletinCategoryPermission.EDIT,
      isUserSuperAdmin,
    );
    if (!hasUserPermissionToCategory) {
      throw new CustomHttpException(BulletinBoardErrorMessage.UNAUTHORIZED_UPDATE_BULLETIN, HttpStatus.FORBIDDEN);
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

    const updatedBulletin = await bulletin.save();

    await this.notifyUsers(dto, updatedBulletin);

    return updatedBulletin;
  }

  async notifyUsers(dto: CreateBulletinDto, resultingBulletin: BulletinDocument) {
    const invitedMembersList = await this.groupsService.getInvitedMembers(
      [...dto.category.visibleForGroups, ...dto.category.editableByGroups],
      [...dto.category.visibleForUsers, ...dto.category.editableByUsers],
    );

    const now = new Date();
    const isWithinVisibilityPeriod =
      (!dto.isVisibleStartDate || now >= new Date(dto.isVisibleStartDate)) &&
      (!dto.isVisibleEndDate || now <= new Date(dto.isVisibleEndDate));

    if (isWithinVisibilityPeriod) {
      SseService.sendEventToUsers(
        invitedMembersList,
        this.bulletinsSseConnections,
        resultingBulletin,
        SSE_MESSAGE_TYPE.UPDATED,
      );
    }
  }

  async removeBulletins(currentUser: JwtUser, ids: string[]) {
    const bulletins = await this.bulletinModel.find({ _id: { $in: ids } }).exec();

    if (bulletins.length !== ids.length) {
      throw new CustomHttpException(BulletinBoardErrorMessage.BULLETIN_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const unauthorizedBulletins = bulletins.filter(
      (bulletin) => bulletin.creator.username !== currentUser.preferred_username,
    );

    const isUserSuperAdmin = currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN);
    if (!isUserSuperAdmin && unauthorizedBulletins.length > 0) {
      throw new CustomHttpException(BulletinBoardErrorMessage.UNAUTHORIZED_DELETE_BULLETIN, HttpStatus.UNAUTHORIZED);
    }

    try {
      await Promise.all(
        bulletins.map(async (bulletin) => {
          if (bulletin.attachmentFileNames?.length) {
            await Promise.all(
              bulletin.attachmentFileNames.map(async (fileName) => {
                const filePath = join(this.attachmentsPath, fileName);
                await FilesystemService.checkIfFileExistAndDelete(filePath);
              }),
            );
          }
        }),
      );

      await this.bulletinModel.deleteMany({ _id: { $in: ids } }).exec();
    } catch (error) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.ATTACHMENT_DELETION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

export default BulletinBoardService;
