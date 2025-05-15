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

import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import GlobalSettingsErrorMessages from '@libs/global-settings/constants/globalSettingsErrorMessages';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import CustomHttpException from '../common/CustomHttpException';
import { GlobalSettings, GlobalSettingsDocument } from './global-settings.schema';

@Injectable()
class GlobalSettingsService implements OnModuleInit {
  constructor(@InjectModel(GlobalSettings.name) private globalSettingsModel: Model<GlobalSettingsDocument>) {}

  async onModuleInit() {
    const count = await this.globalSettingsModel.countDocuments();

    if (count !== 0) {
      return;
    }

    await this.globalSettingsModel.create({
      singleton: true,
      auth: { mfaEnforcedGroups: [] },
      schemaVersion: 1,
    });

    Logger.log(`Imported default values`, GlobalSettings.name);
  }

  async getGlobalSettings(projection?: string) {
    try {
      return await this.globalSettingsModel.findOne({}, projection).lean();
    } catch (error) {
      throw new CustomHttpException(
        GlobalSettingsErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        GlobalSettings.name,
      );
    }
  }

  async setGlobalSettings(globalSettingsDto: GlobalSettingsDto) {
    try {
      const updateWriteResult = await this.globalSettingsModel.updateOne(
        { singleton: true },
        { $set: globalSettingsDto },
      );

      if (updateWriteResult.modifiedCount === 0) {
        throw new Error();
      }

      return updateWriteResult;
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
