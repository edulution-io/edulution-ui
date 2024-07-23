import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppConfigDto } from '@libs/appconfig/types';
import CustomHttpException from '@libs/error/CustomHttpException';
import AppConfigErrorMessages from '@libs/appconfig/types/appConfigErrorMessages';
import GroupRoles from '@libs/user/types/groups/group-roles.enum';
import { AppConfig } from './appconfig.schema';

@Injectable()
class AppConfigService {
  constructor(@InjectModel(AppConfig.name) private readonly appConfigModel: Model<AppConfig>) {}

  async insertConfig(appConfigDto: AppConfigDto[]) {
    try {
      await this.appConfigModel.insertMany(appConfigDto);
      Logger.log(`Wrote appConfig to mongoDB`, AppConfigService.name);
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
            },
          },
          upsert: true,
        },
      }));
      await this.appConfigModel.bulkWrite(bulkOperations);

      Logger.log(`Updated settings appConfig at mongoDB`, AppConfigService.name);
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.WriteAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        AppConfigService.name,
      );
    }
  }

  async getAppConfigs(ldapGroups: string[]): Promise<AppConfig[]> {
    try {
      let appConfig;
      if (ldapGroups.includes(`${GroupRoles.SUPER_ADMIN}`)) {
        appConfig = await this.appConfigModel.find();
      } else {
        appConfig = await this.appConfigModel.find({
          accessGroups: { $in: ldapGroups },
        });
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

  async getAppConfigByName(name: string): Promise<AppConfig | null> {
    try {
      const appConfig = await this.appConfigModel.findOne({ name });
      if (!appConfig) {
        throw new HttpException(`AppConfig with name ${name} not found`, HttpStatus.NOT_FOUND);
      }
      Logger.log(`Get ${name} appConfig from mongoDB`, AppConfigService.name);
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
      Logger.log(`Delete ${configName} entry in apps collection`, AppConfigService.name);
    } catch (e) {
      throw new CustomHttpException(
        AppConfigErrorMessages.DisableAppConfigFailed,
        HttpStatus.SERVICE_UNAVAILABLE,
        AppConfigService.name,
      );
    }
  }
}

export default AppConfigService;
