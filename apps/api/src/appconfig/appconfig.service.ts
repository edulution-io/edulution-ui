import { HttpException, HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { AppConfigDto } from '@libs/appconfig/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import TRAEFIK_CONFIG_FILES_PATH from '@libs/common/constants/traefikConfigPath';
import defaultAppConfig from '@libs/appconfig/constants/defaultAppConfig';
import APP_CONFIG_SECTIONS_NAME_GENERAL from '@libs/appconfig/constants/sectionsNameAppConfigGeneral';
import APP_CONFIG_SECTION_KEYS_GENERAL from '@libs/appconfig/constants/appConfigSectionKeysGeneral';
import { AppConfig } from './appconfig.schema';

@Injectable()
class AppConfigService implements OnModuleInit {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>,
  ) {}

  async onModuleInit() {
    const collections = await this.connection.db?.listCollections({ name: 'appconfigs' }).toArray();

    if (collections?.length === 0) {
      await this.connection.db?.createCollection('appconfigs');
    }

    const count = await this.appConfigModel.countDocuments();

    if (count === 0) {
      await this.appConfigModel.insertMany(defaultAppConfig);
    }
  }

  async insertConfig(appConfigDto: AppConfigDto[]) {
    try {
      await this.appConfigModel.insertMany(appConfigDto);
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        AppConfigService.name,
      );
    }
  }

  async updateConfig(appConfigDto: AppConfigDto[]) {
    try {
      const bulkOperations = appConfigDto.map((appConfig) => {
        const appConfigSections = appConfig.options?.find(
          (section) => section.sectionName === APP_CONFIG_SECTIONS_NAME_GENERAL,
        );
        const proxyConfigField = appConfigSections?.options.find(
          (field) => field.name === APP_CONFIG_SECTION_KEYS_GENERAL.PROXYCONFIG,
        );
        if (proxyConfigField) {
          if (proxyConfigField.value !== '' && proxyConfigField.value !== '""') {
            writeFileSync(
              `${TRAEFIK_CONFIG_FILES_PATH}/${appConfig?.name}.yml`,
              JSON.parse(proxyConfigField.value as string) as string,
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
        AppConfigService.name,
      );
    }
  }

  async getAppConfigs(ldapGroups: string[]): Promise<AppConfigDto[]> {
    try {
      let appConfigDto: AppConfigDto[];
      if (ldapGroups.includes(GroupRoles.SUPER_ADMIN)) {
        appConfigDto = await this.appConfigModel.find({}, 'name icon appType options accessGroups extendedOptions');
      } else {
        const appConfigObjects = await this.appConfigModel.find(
          {
            'accessGroups.path': { $in: ldapGroups },
          },
          'name icon appType options extendedOptions',
        );

        appConfigDto = appConfigObjects.map((config: AppConfigDto) => ({
          appType: config.appType,
          name: config.name,
          icon: config.icon,
          options: config.options,
          color: config.color,
          accessGroups: config.accessGroups,
        }));
      }

      return appConfigDto;
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.ReadAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        AppConfigService.name,
      );
    }
  }

  async getAppConfigByName(name: string): Promise<AppConfig | null> {
    try {
      const appConfig = await this.appConfigModel.findOne({ name });
      if (!appConfig) {
        throw new HttpException(`AppConfig with name ${name} not found`, HttpStatus.NOT_FOUND);
      }
      return appConfig;
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.ReadAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        AppConfigService.name,
      );
    }
  }

  async deleteConfig(configName: string) {
    try {
      await this.appConfigModel.deleteOne({ name: configName });
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.DisableAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
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
        AppConfigService.name,
      );
    }
  }
}

export default AppConfigService;
