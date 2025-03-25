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

import { Connection, Model } from 'mongoose';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import GlobalSettingsErrorMessages from '@libs/global-settings/constants/globalSettingsErrorMessages';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import { GlobalSettings, GlobalSettingsDocument } from './global-settings.schema';

@Injectable()
class GlobalSettingsService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(GlobalSettings.name) private globalSettingsModel: Model<GlobalSettingsDocument>,
  ) {}

  async onModuleInit() {
    const collections = await this.connection.db
      ?.listCollections({ name: GlobalSettings.name.toLowerCase() })
      .toArray();

    if (collections?.length === 0) {
      await this.connection.db?.createCollection(GlobalSettings.name);
      Logger.log(`Created collection: ${GlobalSettings.name}`, GlobalSettings.name);
    }

    const count = await this.globalSettingsModel.countDocuments();

    if (count === 0) {
      // eslint-disable-next-line new-cap
      const defaultSettings = new this.globalSettingsModel({
        singleton: true,
        auth: { mfaEnforcedGroups: [] },
        schemaVersion: 1,
      });

      await defaultSettings.save();
      Logger.log(`Imported default values`, GlobalSettings.name);
    }
  }

  async getGlobalSettings(projection?: string) {
    try {
      return await this.globalSettingsModel.findOne({}, projection).lean();
    } catch (error) {
      return null;
    }
  }

  async setGlobalSettings(globalSettingsDto: GlobalSettingsDto) {
    try {
      const settings = await this.globalSettingsModel.updateOne({ singleton: true }, globalSettingsDto);

      if (settings) {
        return settings;
      }

      return null;
    } catch (error) {
      throw new CustomHttpException(
        GlobalSettingsErrorMessages.UpdateError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        GlobalSettings.name,
      );
    }
  }
}

export default GlobalSettingsService;
