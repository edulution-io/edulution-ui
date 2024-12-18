import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { AppConfigDto } from '@libs/appconfig/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import TRAEFIK_CONFIG_FILES_PATH from '@libs/common/constants/traefikConfigPath';
import { AppConfig } from './appconfig.schema';
import initializeCollection from './initializeCollection';
import MigrationService from '../migration/migration.service';
import appConfigMigrationsList from './migrations/appConfigMigrationsList';

@Injectable()
class AppConfigService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
  ) {}

  async onModuleInit() {
    await initializeCollection(this.connection, this.appConfigModel);

    await MigrationService.runMigrations(this.appConfigModel, appConfigMigrationsList);
  }

  async insertConfig(appConfigDto: AppConfigDto[]) {
    try {
      await this.appConfigModel.insertMany(appConfigDto);
    } catch (error) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        '',
        AppConfigService.name,
      );
    }
  }

  async updateConfig(appConfigDto: AppConfigDto[]) {
    try {
      const bulkOperations = appConfigDto.map((appConfig) => {
        if (appConfig?.options?.proxyConfig) {
          const { proxyConfig } = appConfig.options;
          if (proxyConfig !== '' && proxyConfig !== '""') {
            writeFileSync(
              `${TRAEFIK_CONFIG_FILES_PATH}/${appConfig?.name}.yml`,
              JSON.parse(appConfig?.options?.proxyConfig) as string,
            );
          } else {
            const filePath = `${TRAEFIK_CONFIG_FILES_PATH}/${appConfig?.name}.yml`;

            if (existsSync(filePath)) {
              unlinkSync(filePath);
              Logger.log(`${filePath} deleted.`, AppConfigService.name);
            }
          }
        }

        return {
          updateOne: {
            filter: { name: appConfig.name },
            update: {
              $set: {
                icon: appConfig.icon,
                appType: appConfig.appType,
                options: appConfig.options,
                accessGroups: appConfig.accessGroups,
                extendedOptions: appConfig.extendedOptions,
              },
            },
            upsert: true,
          },
        };
      });

      await this.appConfigModel.bulkWrite(bulkOperations);
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        '',
        AppConfigService.name,
      );
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
        '',
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

  async deleteConfig(configName: string) {
    try {
      await this.appConfigModel.deleteOne({ name: configName });
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.DisableAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        '',
        AppConfigService.name,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  writeConfigFile(appName: string, content: string) {
    try {
      const filePath = `${TRAEFIK_CONFIG_FILES_PATH}/${appName}.yml`;

      writeFileSync(filePath, JSON.parse(content) as string);
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteTraefikConfigFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        AppConfigService.name,
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  getFileAsBase64(filePath: string): string {
    try {
      const fileBuffer = readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.ReadTraefikConfigFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        '',
        AppConfigService.name,
      );
    }
  }
}

export default AppConfigService;
