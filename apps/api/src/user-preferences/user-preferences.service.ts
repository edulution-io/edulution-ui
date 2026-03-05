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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import USER_PREFERENCES_FIELDS from '@libs/user-preferences/constants/user-preferences-fields';
import fieldsToProjection from '@libs/common/utils/fieldsToProjection';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import UpdateBulletinBoardGridRowsDto from '@libs/user-preferences/types/update-bulletin-board-grid-rows.dto';
import UpdateNotificationPreferencesDto from '@libs/user-preferences/types/update-notification-preferences.dto';
import type NotificationPreferencesDto from '@libs/user-preferences/types/notification-preferences.dto';
import { UserPreferences, UserPreferencesDocument } from './user-preferences.schema';

@Injectable()
class UserPreferencesService {
  constructor(
    @InjectModel(UserPreferences.name) private readonly userPreferencesModel: Model<UserPreferencesDocument>,
  ) {}

  async getForUser(username: string, fields: string) {
    const projection = fieldsToProjection(fields);

    const doc = await this.userPreferencesModel
      .findOne({ username })
      .select({ ...projection, _id: 0 })
      .lean();

    return {
      collapsedBulletins: doc?.collapsedBulletins ?? {},
      bulletinBoardGridRows: doc?.bulletinBoardGridRows ?? '1',
      notifications: doc?.notifications ?? { pushEnabled: true, apps: {} },
    };
  }

  async updateBulletinCollapsedState(username: string, updateDto: UpdateBulletinCollapsedDto) {
    return this.userPreferencesModel
      .findOneAndUpdate(
        { username },
        { $set: { [`${USER_PREFERENCES_FIELDS.collapsedBulletins}.${updateDto.bulletinId}`]: updateDto.collapsed } },
        { new: true, upsert: true },
      )
      .lean();
  }

  async updateBulletinBoardGridRows(username: string, updateDto: UpdateBulletinBoardGridRowsDto) {
    return this.userPreferencesModel
      .findOneAndUpdate(
        { username },
        { $set: { [USER_PREFERENCES_FIELDS.bulletinBoardGridRows]: updateDto.gridRows } },
        { new: true, upsert: true },
      )
      .lean();
  }

  async updateNotificationPreferences(
    username: string,
    updateDto: UpdateNotificationPreferencesDto,
  ): Promise<NotificationPreferencesDto> {
    const setFields: Record<string, unknown> = {};

    if (updateDto.pushEnabled !== undefined) {
      setFields[`${USER_PREFERENCES_FIELDS.notifications}.pushEnabled`] = updateDto.pushEnabled;
    }

    if (updateDto.appName !== undefined && updateDto.appEnabled !== undefined) {
      setFields[`${USER_PREFERENCES_FIELDS.notifications}.apps.${updateDto.appName}.enabled`] = updateDto.appEnabled;
    }

    if (updateDto.appName !== undefined && updateDto.appSchedules !== undefined) {
      setFields[`${USER_PREFERENCES_FIELDS.notifications}.apps.${updateDto.appName}.schedules`] =
        updateDto.appSchedules;
    }

    const doc = await this.userPreferencesModel
      .findOneAndUpdate({ username }, { $set: setFields }, { new: true, upsert: true })
      .lean();

    const notifications = doc?.notifications;

    return {
      pushEnabled: notifications?.pushEnabled ?? true,
      apps: (notifications?.apps ?? {}) as unknown as NotificationPreferencesDto['apps'],
    };
  }

  async getNotificationPreferencesByUsernames(usernames: string[]): Promise<Map<string, NotificationPreferencesDto>> {
    const docs = await this.userPreferencesModel
      .find({ username: { $in: usernames } })
      .select({ username: 1, notifications: 1, _id: 0 })
      .lean();

    const result = new Map<string, NotificationPreferencesDto>();
    docs.forEach((doc) => {
      if (doc.notifications) {
        result.set(doc.username, doc.notifications as unknown as NotificationPreferencesDto);
      }
    });

    return result;
  }

  async unsetCollapsedForBulletins(bulletinIds: string[]): Promise<void> {
    if (!bulletinIds?.length) return;

    const unsetObj = Object.fromEntries(
      bulletinIds.map((id) => [`${USER_PREFERENCES_FIELDS.collapsedBulletins}.${id}`, 1]),
    );

    const filter = {
      $or: bulletinIds.map((id) => ({ [`${USER_PREFERENCES_FIELDS.collapsedBulletins}.${id}`]: { $exists: true } })),
    };

    await this.userPreferencesModel.updateMany(filter, { $unset: unsetObj }).exec();
  }
}

export default UserPreferencesService;
