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

import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AnyBulkWriteOperation, Connection, Model } from 'mongoose';
import { readFileSync, writeFileSync } from 'fs';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import TRAEFIK_CONFIG_FILES_PATH from '@libs/common/constants/traefikConfigPath';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import APPS from '@libs/appconfig/constants/apps';
import CustomHttpException from '../common/CustomHttpException';
import { AppConfig } from './appconfig.schema';
import initializeCollection from './initializeCollection';
import MigrationService from '../migration/migration.service';
import appConfigMigrationsList from './migrations/appConfigMigrationsList';
import FilesystemService from '../filesystem/filesystem.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

@Injectable()
class AppConfigService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
    private eventEmitter: EventEmitter2,
    private readonly globalSettingsService: GlobalSettingsService,
  ) {}

  async onModuleInit() {
    await initializeCollection(this.connection, this.appConfigModel);

    await MigrationService.runMigrations<AppConfig>(this.appConfigModel, appConfigMigrationsList);
  }

  async insertConfig(appConfigDto: AppConfigDto, ldapGroups: string[]) {
    try {
      await this.appConfigModel.create(appConfigDto);
      return await this.getAppConfigs(ldapGroups);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    } finally {
      await AppConfigService.writeProxyConfigFile(appConfigDto);
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED);
    }
  }

  async updateConfig(name: string, appConfigDto: AppConfigDto, ldapGroups: string[]): Promise<AppConfigDto[]> {
    try {
      const existingAppConfig = await this.appConfigModel.findOne({ name }).lean();
      const oldPosition = existingAppConfig?.position;
      const newPosition = appConfigDto.position;

      const bulkOperations: AnyBulkWriteOperation<AppConfig>[] = [];

      if (existingAppConfig && oldPosition !== newPosition) {
        if (oldPosition! < newPosition) {
          bulkOperations.push({
            updateMany: {
              filter: { position: { $gt: oldPosition, $lte: newPosition } },
              update: { $inc: { position: -1 } },
            },
          });
        } else {
          bulkOperations.push({
            updateMany: {
              filter: { position: { $gte: newPosition, $lt: oldPosition } },
              update: { $inc: { position: 1 } },
            },
          });
        }
      }

      bulkOperations.push({
        updateOne: {
          filter: { name },
          update: {
            $set: {
              icon: appConfigDto.icon,
              appType: appConfigDto.appType,
              options: appConfigDto.options,
              accessGroups: appConfigDto.accessGroups,
              extendedOptions: appConfigDto.extendedOptions,
              position: newPosition,
            },
          },
          upsert: true,
        },
      });

      await this.appConfigModel.bulkWrite(bulkOperations, { ordered: true });

      return await this.getAppConfigs(ldapGroups);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    } finally {
      await AppConfigService.writeProxyConfigFile(appConfigDto);
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED);
    }
  }

  async patchSingleFieldInConfig(name: string, patchConfigDto: PatchConfigDto, ldapGroups: string[]) {
    try {
      await this.appConfigModel.updateOne({ name }, { $set: { [patchConfigDto.field]: patchConfigDto.value } });
      return await this.getAppConfigs(ldapGroups);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    } finally {
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED);
    }
  }

  static async writeProxyConfigFile(appConfigDto: AppConfigDto) {
    if (appConfigDto?.options?.proxyConfig) {
      const { proxyConfig } = appConfigDto.options;
      if (proxyConfig !== '' && proxyConfig !== '""') {
        writeFileSync(
          `${TRAEFIK_CONFIG_FILES_PATH}/${appConfigDto?.name}.yml`,
          JSON.parse(appConfigDto?.options?.proxyConfig) as string,
        );
      } else {
        const doesFileExist = await FilesystemService.checkIfFileExist(
          `${TRAEFIK_CONFIG_FILES_PATH}/${appConfigDto?.name}.yml`,
        );
        if (doesFileExist) {
          await FilesystemService.deleteFile(TRAEFIK_CONFIG_FILES_PATH, `${appConfigDto?.name}.yml`);
        }
      }
    }
  }

  async getAppConfigs(ldapGroups: string[]): Promise<AppConfigDto[]> {
    try {
      let appConfigDto: AppConfigDto[];
      if (getIsAdmin(ldapGroups)) {
        appConfigDto = await this.appConfigModel
          .find({}, 'name translations icon appType options accessGroups extendedOptions position')
          .sort({ position: 1 })
          .lean();
      } else {
        const appConfigObjects = await this.appConfigModel
          .find(
            { 'accessGroups.path': { $in: ldapGroups } },
            'name translations icon appType options extendedOptions position',
          )
          .sort({ position: 1 })
          .lean();

        appConfigDto = appConfigObjects.map((config) => ({
          name: config.name,
          translations: config.translations,
          icon: config.icon,
          appType: config.appType,
          options: { url: config.options.url ?? '' },
          accessGroups: [],
          extendedOptions: config.extendedOptions,
          position: config.position,
        }));
      }

      return appConfigDto;
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.ReadAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    }
  }

  async getAppConfigByName(name: string): Promise<AppConfigDto | undefined> {
    const appConfig = await this.appConfigModel.findOne({ name }).lean();
    if (!appConfig) {
      Logger.debug(`AppConfig with name ${name} not found`, AppConfigService.name);
      return undefined;
    }
    return appConfig;
  }

  async deleteConfig(configName: string, ldapGroups: string[]): Promise<AppConfigDto[]> {
    try {
      const appConfigToDelete = await this.appConfigModel.findOne({ name: configName }).lean();
      const deletedPosition = appConfigToDelete?.position;

      const bulkOperations: AnyBulkWriteOperation<AppConfig>[] = [];

      bulkOperations.push({
        deleteOne: {
          filter: { name: configName },
        },
      });

      if (typeof deletedPosition === 'number') {
        bulkOperations.push({
          updateMany: {
            filter: { position: { $gt: deletedPosition } },
            update: { $inc: { position: -1 } },
          },
        });
      }

      await this.appConfigModel.bulkWrite(bulkOperations, { ordered: true });

      const appConfigs = await this.getAppConfigs(ldapGroups);

      const globalSettings = await this.globalSettingsService.getGlobalSettings();
      if (globalSettings?.general?.defaultLandingPage?.appName === configName) {
        const appConfigAtPosition1 = appConfigs.find((c) => c.position === 1);
        await this.globalSettingsService.setGlobalSettings({
          ...globalSettings,
          general: {
            ...globalSettings.general,
            defaultLandingPage: {
              isCustomLandingPageEnabled: true,
              appName: appConfigAtPosition1?.name || APPS.DASHBOARD,
            },
          },
        });
      }

      return appConfigs;
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.DisableAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    } finally {
      const doesFileExist = await FilesystemService.checkIfFileExist(`${TRAEFIK_CONFIG_FILES_PATH}/${configName}.yml`);
      if (doesFileExist) {
        await FilesystemService.deleteFile(TRAEFIK_CONFIG_FILES_PATH, `${configName}.yml`);
      }

      const doesFolderExist = await FilesystemService.checkIfFileExist(`${APPS_FILES_PATH}/${configName}`);
      if (doesFolderExist) {
        await FilesystemService.deleteDirectories([`${APPS_FILES_PATH}/${configName}`]);
      }

      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED);
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getFileAsBase64(filePath: string): string {
    try {
      const fileBuffer = readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.ReadTraefikConfigFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        AppConfigService.name,
      );
    }
  }
}

export default AppConfigService;
