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
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import GlobalSettingsErrorMessages from '@libs/global-settings/constants/globalSettingsErrorMessages';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import { GLOBAL_SETTINGS_ROOT_ENDPOINT } from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { DEPLOYMENT_TARGET_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import CustomHttpException from '../common/CustomHttpException';
import { GlobalSettings, GlobalSettingsDocument } from './global-settings.schema';
import MigrationService from '../migration/migration.service';
import globalSettingsMigrationsList from './migrations/globalSettingsMigrationsList';

@Injectable()
class GlobalSettingsService implements OnModuleInit {
  constructor(
    @InjectModel(GlobalSettings.name) private globalSettingsModel: Model<GlobalSettingsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async onModuleInit() {
    const count = await this.globalSettingsModel.countDocuments();

    if (count !== 0) {
      await MigrationService.runMigrations<GlobalSettingsDocument>(
        this.globalSettingsModel,
        globalSettingsMigrationsList,
      );

      await this.updateCache();

      return;
    }

    await this.globalSettingsModel.create({
      singleton: true,
      ...defaultValues,
    });

    Logger.log(`Imported default values`, GlobalSettings.name);
  }

  async invalidateCache(): Promise<void> {
    try {
      await this.cacheManager.del(`/${EDU_API_ROOT}/${GLOBAL_SETTINGS_ROOT_ENDPOINT}`);
    } catch (error) {
      Logger.warn(`Failed to invalidate cache for GlobalSettings: ${(error as Error).message}`, GlobalSettings.name);
    }
  }

  async updateCache() {
    try {
      const globalSetting = await this.getGlobalSettings('general.deploymentTarget');
      if (!globalSetting?.general) {
        Logger.warn(`Global settings not found`, GlobalSettings.name);
        return null;
      }

      const { deploymentTarget } = globalSetting.general;

      await this.cacheManager.set(DEPLOYMENT_TARGET_CACHE_KEY, deploymentTarget);

      return deploymentTarget;
    } catch (error) {
      Logger.warn(`Failed to update cache: ${(error as Error).message}`, GlobalSettings.name);
      return null;
    }
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

      await this.invalidateCache();

      await this.updateCache();

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
