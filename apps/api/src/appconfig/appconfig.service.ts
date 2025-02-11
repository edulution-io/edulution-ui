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

import { HttpException, HttpStatus, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Connection, Model } from 'mongoose';
import { readFileSync, writeFileSync } from 'fs';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import CustomHttpException from '@libs/error/CustomHttpException';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import TRAEFIK_CONFIG_FILES_PATH from '@libs/common/constants/traefikConfigPath';
import EVENT_EMITTER_EVENTS from '@libs/appconfig/constants/eventEmitterEvents';
import type PatchConfigDto from '@libs/common/types/patchConfigDto';
import { AppConfig } from './appconfig.schema';
import initializeCollection from './initializeCollection';
import MigrationService from '../migration/migration.service';
import appConfigMigrationsList from './migrations/appConfigMigrationsList';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class AppConfigService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
    private eventEmitter: EventEmitter2,
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
      AppConfigService.writeProxyConfigFile(appConfigDto);
      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED);
    }
  }

  async updateConfig(name: string, appConfigDto: AppConfigDto, ldapGroups: string[]) {
    try {
      await this.appConfigModel.updateOne(
        { name },
        {
          $set: {
            icon: appConfigDto.icon,
            appType: appConfigDto.appType,
            options: appConfigDto.options,
            accessGroups: appConfigDto.accessGroups,
            extendedOptions: appConfigDto.extendedOptions,
          },
        },
        { upsert: true },
      );
      return await this.getAppConfigs(ldapGroups);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    } finally {
      AppConfigService.writeProxyConfigFile(appConfigDto);
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

  static writeProxyConfigFile(appConfigDto: AppConfigDto) {
    if (appConfigDto?.options?.proxyConfig) {
      const { proxyConfig } = appConfigDto.options;
      if (proxyConfig !== '' && proxyConfig !== '""') {
        writeFileSync(
          `${TRAEFIK_CONFIG_FILES_PATH}/${appConfigDto?.name}.yml`,
          JSON.parse(appConfigDto?.options?.proxyConfig) as string,
        );
      } else {
        const filePath = `${TRAEFIK_CONFIG_FILES_PATH}/${appConfigDto?.name}.yml`;

        FilesystemService.checkIfFileExistAndDelete(filePath);
      }
    }
  }

  async getAppConfigs(ldapGroups: string[]): Promise<AppConfigDto[]> {
    try {
      let appConfigDto: AppConfigDto[];
      if (ldapGroups.includes(GroupRoles.SUPER_ADMIN)) {
        appConfigDto = await this.appConfigModel
          .find({}, 'name icon appType options accessGroups extendedOptions')
          .lean();
      } else {
        const appConfigObjects = await this.appConfigModel
          .find(
            {
              'accessGroups.path': { $in: ldapGroups },
            },
            'name icon appType options extendedOptions',
          )
          .lean();

        appConfigDto = appConfigObjects.map((config) => ({
          name: config.name,
          icon: config.icon,
          appType: config.appType,
          options: { url: config.options.url ?? '' },
          accessGroups: [],
          extendedOptions: config.extendedOptions,
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

  async getAppConfigByName(name: string): Promise<AppConfigDto> {
    const appConfig = await this.appConfigModel.findOne({ name }).lean();
    if (!appConfig) {
      throw new HttpException(`AppConfig with name ${name} not found`, HttpStatus.NOT_FOUND);
    }
    return appConfig;
  }

  async deleteConfig(configName: string, ldapGroups: string[]) {
    try {
      await this.appConfigModel.deleteOne({ name: configName });
      return await this.getAppConfigs(ldapGroups);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.DisableAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        undefined,
        AppConfigService.name,
      );
    } finally {
      const filePath = `${TRAEFIK_CONFIG_FILES_PATH}/${configName}.yml`;

      FilesystemService.checkIfFileExistAndDelete(filePath);

      this.eventEmitter.emit(EVENT_EMITTER_EVENTS.APPCONFIG_UPDATED);
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  writeConfigFile(appName: string, content: string) {
    try {
      const filePath = `${TRAEFIK_CONFIG_FILES_PATH}/${appName}.yml`;

      writeFileSync(filePath, JSON.parse(content) as string);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteTraefikConfigFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        AppConfigService.name,
      );
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
