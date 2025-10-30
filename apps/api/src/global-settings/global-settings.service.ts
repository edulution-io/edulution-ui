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

import { Model, ProjectionType } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import GlobalSettingsErrorMessages from '@libs/global-settings/constants/globalSettingsErrorMessages';
import type GlobalSettingsDto from '@libs/global-settings/types/globalSettings.dto';
import defaultValues from '@libs/global-settings/constants/defaultValues';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import {
  GLOBAL_SETTINGS_PUBLIC_THEME_ENDPOINT,
  GLOBAL_SETTINGS_ROOT_ENDPOINT,
} from '@libs/global-settings/constants/globalSettingsApiEndpoints';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ADMIN_GROUPS, DEPLOYMENT_TARGET_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import DEFAULT_THEME from '@libs/global-settings/constants/defaultTheme';
import CustomHttpException from '../common/CustomHttpException';
import { GlobalSettings, GlobalSettingsDocument } from './global-settings.schema';
import MigrationService from '../migration/migration.service';
import globalSettingsMigrationsList from './migrations/globalSettingsMigrationsList';

@Injectable()
class GlobalSettingsService implements OnModuleInit {
  constructor(
    @InjectModel(GlobalSettings.name) private globalSettingsModel: Model<GlobalSettingsDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.globalSettingsModel.countDocuments();

    if (count !== 0) {
      await MigrationService.runMigrations<GlobalSettingsDocument>(
        this.globalSettingsModel,
        globalSettingsMigrationsList,
      );

      await this.setDeploymentTargetInCache();
      await this.setAdminGroupsInCache();

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
      await this.cacheManager.del(
        `/${EDU_API_ROOT}/${GLOBAL_SETTINGS_ROOT_ENDPOINT}/${GLOBAL_SETTINGS_PUBLIC_THEME_ENDPOINT}`,
      );
    } catch (error) {
      Logger.warn(`Failed to invalidate cache for GlobalSettings: ${(error as Error).message}`, GlobalSettings.name);
    }
  }

  async setDeploymentTargetInCache() {
    try {
      const globalSetting = await this.getGlobalSettings('general.deploymentTarget');
      if (!globalSetting?.general?.deploymentTarget) {
        Logger.warn(`Global setting for deploymentTarget not found`, GlobalSettings.name);
        return null;
      }

      const { deploymentTarget } = globalSetting.general;

      await this.cacheManager.set(DEPLOYMENT_TARGET_CACHE_KEY, deploymentTarget);

      return deploymentTarget;
    } catch (error) {
      Logger.warn(`Failed to update deployment target cache: ${(error as Error).message}`, GlobalSettings.name);
      return null;
    }
  }

  async getAdminGroupsFromCache() {
    const adminGroups = await this.cacheManager.get<string[]>(ADMIN_GROUPS);

    if (!adminGroups) {
      Logger.verbose('adminGroups missing in redis cache, refreshing via DB', GlobalSettingsService.name);
      return this.setAdminGroupsInCache();
    }

    return adminGroups;
  }

  async setAdminGroupsInCache() {
    try {
      const globalSetting = await this.getGlobalSettings('auth.adminGroups');

      const initialAdminGroups = this.configService.get<string>('EDUI_INITIAL_ADMIN_GROUP', '');
      const normalizedGroup = initialAdminGroups.startsWith('/') ? initialAdminGroups : `/${initialAdminGroups}`;

      let adminGroupsList: string[] = [normalizedGroup];

      if (Array.isArray(globalSetting?.auth?.adminGroups) && globalSetting.auth.adminGroups.length > 0) {
        adminGroupsList = globalSetting.auth.adminGroups.map((group) => group.path);
      }

      await this.cacheManager.set(ADMIN_GROUPS, adminGroupsList);

      Logger.debug(`Cached admin groups: ${JSON.stringify(adminGroupsList)}`, GlobalSettingsService.name);

      return adminGroupsList;
    } catch (error) {
      Logger.warn(`Failed to update admin groups cache: ${(error as Error).message}`, GlobalSettingsService.name);
      return [];
    }
  }

  async getGlobalSettings(projection?: string) {
    try {
      const PUBLIC_PROJECTION: ProjectionType<GlobalSettingsDocument> = {
        'general.ldap': 0,
      } as const;

      return await this.globalSettingsModel.findOne({}, projection || PUBLIC_PROJECTION).lean();
    } catch (error) {
      throw new CustomHttpException(
        GlobalSettingsErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        GlobalSettings.name,
      );
    }
  }

  async getGlobalAdminSettings() {
    try {
      return await this.globalSettingsModel.findOne({}).lean();
    } catch (error) {
      throw new CustomHttpException(
        GlobalSettingsErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        GlobalSettings.name,
      );
    }
  }

  async getPublicTheme() {
    try {
      const settings = await this.globalSettingsModel.findOne({}, { theme: 1, _id: 0 }).lean();
      return {
        light: {
          ...DEFAULT_THEME.light,
          ...(settings?.theme?.light ?? {}),
        },
        dark: {
          ...DEFAULT_THEME.dark,
          ...(settings?.theme?.dark ?? {}),
        },
      };
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

      if (updateWriteResult.matchedCount === 0) {
        throw new Error();
      }

      await this.invalidateCache();

      await this.setDeploymentTargetInCache();
      await this.setAdminGroupsInCache();

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
