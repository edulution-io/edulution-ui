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

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import USER_PREFERENCES_FIELDS from '@libs/user-preferences/constants/user-preferences-fields';
import fieldsToProjection from '@libs/common/utils/fieldsToProjection';
import UpdateBulletinCollapsedDto from '@libs/user-preferences/types/update-bulletin-collapsed.dto';
import { UserPreferences, UserPreferencesDocument } from './user-preferences.schema';

@Injectable()
class UserPreferencesService {
  constructor(@InjectModel(UserPreferences.name) private readonly model: Model<UserPreferencesDocument>) {}

  async getForUser(username: string, fields: string) {
    const projection = fieldsToProjection(fields);

    const doc = await this.model
      .findOne({ username })
      .select({ ...projection, _id: 0 })
      .lean();

    return {
      collapsedBulletins: doc?.collapsedBulletins ?? {},
    };
  }

  async updateBulletinCollapsedState(username: string, updateDto: UpdateBulletinCollapsedDto) {
    return this.model
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

    await this.model.updateMany(filter, { $unset: unsetObj }).exec();
  }
}

export default UserPreferencesService;
