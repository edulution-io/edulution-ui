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

import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import USER_PREFERENCES_FIELDS from '@libs/user-preferences/constants/user-preferences-fields';
import fieldsToProjection from '@libs/common/utils/fieldsToProjection';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import NotificationSettings from '@libs/user-preferences/types/notificationSettings';
import TApps from '@libs/appconfig/types/appsType';
import UserPreferencesErrorMessages from '@libs/user-preferences/constants/userPreferencesErrorMessages';
import CustomHttpException from '../common/CustomHttpException';
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

  async getNotificationSettings(username: string): Promise<NotificationSettings> {
    const doc = await this.userPreferencesModel.findOne({ username }).select('notificationSettings').lean();

    return doc?.notificationSettings ?? { pushEnabled: true, modulePreferences: {} };
  }

  async updateNotificationSettings(
    username: string,
    notificationSettings: NotificationSettings,
  ): Promise<NotificationSettings> {
    const doc = await this.userPreferencesModel
      .findOneAndUpdate({ username }, { $set: { notificationSettings } }, { new: true, upsert: true })
      .select('notificationSettings')
      .lean();

    if (!doc?.notificationSettings) {
      throw new CustomHttpException(
        UserPreferencesErrorMessages.NotificationUpdateError,
        HttpStatus.NOT_MODIFIED,
        undefined,
        UserPreferencesService.name,
      );
    }

    return doc.notificationSettings;
  }

  async filterUsernamesByNotificationSettings(usernames: string[], app: TApps): Promise<string[]> {
    if (usernames.length === 0) return [];

    const preferences = await this.userPreferencesModel
      .find({ username: { $in: usernames } })
      .select('username notificationSettings')
      .lean();

    const preferencesMap = new Map(preferences.map((p) => [p.username, p.notificationSettings]));

    return usernames.filter((username) => {
      const settings = preferencesMap.get(username);

      if (!settings) return true;
      if (settings.pushEnabled === false) return false;
      return settings.modulePreferences?.[app] !== false;
    });
  }
}

export default UserPreferencesService;
