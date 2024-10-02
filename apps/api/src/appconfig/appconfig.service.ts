import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { readFileSync } from 'fs';
import { AppConfigDto } from '@libs/appconfig/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import { AppConfig } from './appconfig.schema';

@Injectable()
class AppConfigService {
  constructor(@InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>) {}

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
      const bulkOperations = appConfigDto.map((appConfig) => ({
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
      }));
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

        appConfigDto = appConfigObjects.map((config) => ({
          name: config.name,
          icon: config.icon,
          appType: config.appType,
          options: { url: config.options.url ?? '' },
          accessGroups: [],
          extendedOptions: config.extendedOptions ?? [],
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
  getFileAsBase64(filePath: string): string {
    try {
      const fileBuffer = readFileSync(filePath);
      return fileBuffer.toString('base64');
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.ReadAppConfigFailed,
        HttpStatus.INTERNAL_SERVER_ERROR,
        AppConfigService.name,
      );
    }
  }
}

export default AppConfigService;
