/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Response } from 'express';
import { Model, Types } from 'mongoose';
import CreateBulletinDto from '@libs/bulletinBoard/types/createBulletinDto';
import { join } from 'path';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import BulletinsByCategories from '@libs/bulletinBoard/types/bulletinsByCategories';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import BulletinBoardErrorMessage from '@libs/bulletinBoard/types/bulletinBoardErrorMessage';
import BulletinCategoryResponseDto from '@libs/bulletinBoard/types/bulletinCategoryResponseDto';
import BulletinCategoryPermission from '@libs/appconfig/constants/bulletinCategoryPermission';
import BULLETIN_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinAttachmentsPath';
import BULLETIN_TEMP_ATTACHMENTS_PATH from '@libs/bulletinBoard/constants/bulletinTempAttachmentsPath';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../common/CustomHttpException';
import { Bulletin, BulletinDocument } from './bulletin.schema';
import { BulletinCategory, BulletinCategoryDocument } from '../bulletin-category/bulletin-category.schema';
import BulletinCategoryService from '../bulletin-category/bulletin-category.service';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import FilesystemService from '../filesystem/filesystem.service';
import NotificationsService from '../notifications/notifications.service';
import UserPreferencesService from '../user-preferences/user-preferences.service';
import MigrationService from '../migration/migration.service';
import bulletinsMigrationList from './migrations/bulletinsMigrationList';
import GlobalSettingsService from '../global-settings/global-settings.service';

@Injectable()
class BulletinBoardService implements OnModuleInit {
  constructor(
    @InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>,
    @InjectModel(BulletinCategory.name) private bulletinCategoryModel: Model<BulletinCategoryDocument>,
    private readonly bulletinCategoryService: BulletinCategoryService,
    private fileSystemService: FilesystemService,
    private readonly groupsService: GroupsService,
    private readonly sseService: SseService,
    private readonly notificationService: NotificationsService,
    private readonly userPreferencesService: UserPreferencesService,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  private readonly attachmentsPath = BULLETIN_ATTACHMENTS_PATH;

  async onModuleInit() {
    void this.fileSystemService.ensureDirectoryExists(this.attachmentsPath);

    await MigrationService.runMigrations<BulletinDocument>(this.bulletinModel, bulletinsMigrationList);
  }

  async serveBulletinAttachment(filePath: string, res: Response) {
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async serveBulletinAttachmentIfExists(filename: string, res: Response) {
    const permanentFilePath = join(BULLETIN_ATTACHMENTS_PATH, filename);
    const existPermanentFile = await FilesystemService.checkIfFileExist(permanentFilePath);
    if (existPermanentFile) {
      await this.serveBulletinAttachment(permanentFilePath, res);
      return res;
    }
    const temporaryFilePath = join(BULLETIN_TEMP_ATTACHMENTS_PATH, filename);
    const existTemporaryFile = await FilesystemService.checkIfFileExist(temporaryFilePath);
    if (existTemporaryFile) {
      await this.serveBulletinAttachment(temporaryFilePath, res);
      return res;
    }
    throw new CustomHttpException(
      BulletinBoardErrorMessage.ATTACHMENT_NOT_FOUND,
      HttpStatus.NOT_FOUND,
      undefined,
      BulletinBoardService.name,
    );
  }

  async updateBulletinAttachments(
    content: string,
    attachedFileNames: string[],
    previousAttachmentFileNames?: string[],
  ) {
    const fileNames: string[] = [];
    (attachedFileNames || []).forEach((name) => {
      if (content.includes(`<img src="/edu-api/bulletinboard/attachments/${name}?token={{token}}">`)) {
        fileNames.push(name);
      }
    });

    if (previousAttachmentFileNames) {
      await Promise.all(
        previousAttachmentFileNames.map(async (fileName) => {
          if (!fileNames.includes(fileName)) {
            const permanentFilePath = join(BULLETIN_ATTACHMENTS_PATH, fileName);
            await FilesystemService.checkIfFileExistAndDelete(permanentFilePath);
          }
        }),
      );
    }

    const temporaryFiles = await this.fileSystemService.getAllFilenamesInDirectory(BULLETIN_TEMP_ATTACHMENTS_PATH);
    await Promise.all(
      temporaryFiles.map(async (fileName) => {
        if (!fileNames.includes(fileName)) {
          await FilesystemService.deleteFile(BULLETIN_TEMP_ATTACHMENTS_PATH, fileName);
        } else {
          const tempFilePath = join(BULLETIN_TEMP_ATTACHMENTS_PATH, fileName);
          const permanentFilePath = join(BULLETIN_ATTACHMENTS_PATH, fileName);
          await FilesystemService.moveFile(tempFilePath, permanentFilePath);
        }
      }),
    );
    return fileNames;
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
    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    if (filterOnlyActiveBulletins !== undefined) {
      filter.isActive = filterOnlyActiveBulletins;
    } else if (!getIsAdmin(currentUser.ldapGroups, adminGroups)) {
      filter['creator.username'] = currentUser.preferred_username;
    }
    const bulletins = await this.bulletinModel.find(filter).populate('category').sort({ updatedAt: -1 }).exec();

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
      throw new CustomHttpException(
        BulletinBoardErrorMessage.INVALID_CATEGORY,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        BulletinBoardService.name,
      );
    }

    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    const hasUserPermission = await this.bulletinCategoryService.hasUserPermission(
      currentUser.preferred_username,
      dto.category.id,
      BulletinCategoryPermission.EDIT,
      getIsAdmin(currentUser.ldapGroups, adminGroups),
    );
    if (!hasUserPermission) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.UNAUTHORIZED_CREATE_BULLETIN,
        HttpStatus.FORBIDDEN,
        undefined,
        BulletinBoardService.name,
      );
    }

    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };
    const content = BulletinBoardService.replaceContentTokenWithPlaceholder(dto.content);
    const attachmentFileNames = await this.updateBulletinAttachments(content, dto.attachmentFileNames, []);

    const createdBulletin = await this.bulletinModel.create({
      creator,
      title: dto.title,
      attachmentFileNames,
      content,
      category: new Types.ObjectId(dto.category.id),
      isVisibleStartDate: dto.isVisibleStartDate,
      isVisibleEndDate: dto.isVisibleEndDate,
    });

    await this.notifyUsers(dto, createdBulletin, currentUser);

    return createdBulletin;
  }

  private static replaceContentTokenWithPlaceholder(content: string): string {
    return content.replace(/token=[^&"]+/g, 'token={{token}}');
  }

  async updateBulletin(currentUser: JwtUser, id: string, dto: CreateBulletinDto) {
    const bulletin = await this.bulletinModel.findById(id).exec();
    if (!bulletin) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.BULLETIN_NOT_FOUND,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        BulletinBoardService.name,
      );
    }

    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    const isUserSuperAdmin = getIsAdmin(currentUser.ldapGroups, adminGroups);
    if (bulletin.creator.username !== currentUser.preferred_username && !isUserSuperAdmin) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.UNAUTHORIZED_UPDATE_BULLETIN,
        HttpStatus.UNAUTHORIZED,
        undefined,
        BulletinBoardService.name,
      );
    }

    const category = await this.bulletinCategoryModel.findById(dto.category.id).exec();
    if (!category) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.INVALID_CATEGORY,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        BulletinBoardService.name,
      );
    }

    const hasUserPermissionToCategory = await this.bulletinCategoryService.hasUserPermission(
      currentUser.preferred_username,
      dto.category.id,
      BulletinCategoryPermission.EDIT,
      isUserSuperAdmin,
    );
    if (!hasUserPermissionToCategory) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.UNAUTHORIZED_UPDATE_BULLETIN,
        HttpStatus.FORBIDDEN,
        undefined,
        BulletinBoardService.name,
      );
    }

    const updatedBy = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    const content = BulletinBoardService.replaceContentTokenWithPlaceholder(dto.content);
    const attachmentFileNames = await this.updateBulletinAttachments(
      content,
      dto.attachmentFileNames,
      bulletin.attachmentFileNames,
    );

    bulletin.title = dto.title;
    bulletin.isActive = dto.isActive;
    bulletin.content = content;
    bulletin.category = new Types.ObjectId(dto.category.id);
    bulletin.isVisibleStartDate = dto.isVisibleStartDate;
    bulletin.attachmentFileNames = attachmentFileNames;
    bulletin.isVisibleEndDate = dto.isVisibleEndDate;
    bulletin.updatedBy = updatedBy;

    const updatedBulletin = await bulletin.save();

    await this.notifyUsers(dto, updatedBulletin, currentUser);

    return updatedBulletin;
  }

  async notifyUsers(dto: CreateBulletinDto, resultingBulletin: BulletinDocument, currentUser?: JwtUser) {
    let invitedMembersList = await this.groupsService.getInvitedMembers(
      [...dto.category.visibleForGroups, ...dto.category.editableByGroups],
      [...dto.category.visibleForUsers, ...dto.category.editableByUsers],
    );

    if (currentUser) {
      invitedMembersList = invitedMembersList.filter((username) => username !== currentUser.preferred_username);
    }

    const now = new Date();
    const isWithinVisibilityPeriod =
      (!dto.isVisibleStartDate || now >= new Date(dto.isVisibleStartDate)) &&
      (!dto.isVisibleEndDate || now <= new Date(dto.isVisibleEndDate));

    if (isWithinVisibilityPeriod) {
      this.sseService.sendEventToUsers(invitedMembersList, resultingBulletin, SSE_MESSAGE_TYPE.BULLETIN_UPDATED);

      // TODO: #1152
      const title = `Aushang bereit: ${dto.title}`;

      await this.notificationService.notifyUsernames(invitedMembersList, {
        title,
        data: {
          bulletinId: resultingBulletin.id,
          type: SSE_MESSAGE_TYPE.BULLETIN_UPDATED,
        },
      });
    }
  }

  async removeBulletins(currentUser: JwtUser, ids: string[]) {
    const bulletins = await this.bulletinModel.find({ _id: { $in: ids } }).exec();

    if (bulletins.length !== ids.length) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.BULLETIN_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        BulletinBoardService.name,
      );
    }

    const unauthorizedBulletins = bulletins.filter(
      (bulletin) => bulletin.creator.username !== currentUser.preferred_username,
    );

    const adminGroups = await this.globalSettingsService.getAdminGroupsFromCache();

    const isUserSuperAdmin = getIsAdmin(currentUser.ldapGroups, adminGroups);
    if (!isUserSuperAdmin && unauthorizedBulletins.length > 0) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.UNAUTHORIZED_DELETE_BULLETIN,
        HttpStatus.UNAUTHORIZED,
        undefined,
        BulletinBoardService.name,
      );
    }

    try {
      await Promise.all(
        bulletins.map(async (bulletin) => {
          if (bulletin.attachmentFileNames?.length) {
            await Promise.all(
              bulletin.attachmentFileNames.map(async (fileName) => {
                const permanentFilePath = join(BULLETIN_ATTACHMENTS_PATH, fileName);
                await FilesystemService.checkIfFileExistAndDelete(permanentFilePath);
                const temporaryFilePath = join(BULLETIN_TEMP_ATTACHMENTS_PATH, fileName);
                await FilesystemService.checkIfFileExistAndDelete(temporaryFilePath);
              }),
            );
          }
        }),
      );

      await this.bulletinModel.deleteMany({ _id: { $in: ids } }).exec();

      try {
        await this.userPreferencesService.unsetCollapsedForBulletins(ids);
      } catch (error) {
        Logger.error((error as Error).message, BulletinBoardService.name);
      }
    } catch (error) {
      throw new CustomHttpException(
        BulletinBoardErrorMessage.ATTACHMENT_DELETION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        BulletinBoardService.name,
      );
    }
  }
}

export default BulletinBoardService;
