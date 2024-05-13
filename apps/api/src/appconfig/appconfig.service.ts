import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppConfig } from './appconfig.types';
import LoggerEnum from '../types/logger';

@Injectable()
class AppConfigService {
  constructor(@InjectModel('AppConfig') private readonly appConfigModel: Model<AppConfig>) {}

  async insertConfig(appConfigDto: AppConfig[]) {
    try {
      await this.appConfigModel.insertMany(appConfigDto);
      Logger.log(`Wrote appConfig to mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.error(e, LoggerEnum.MONGODB);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async updateConfig(appConfigDto: AppConfig[]) {
    try {
      const bulkOperations = appConfigDto.map((appConfig) => ({
        updateOne: {
          filter: { name: appConfig.name },
          update: { $set: { linkPath: appConfig.linkPath, icon: appConfig.icon, appType: appConfig.appType } },
          upsert: true,
        },
      }));
      await this.appConfigModel.bulkWrite(bulkOperations);

      Logger.log(`Updated settings appConfig at mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.error(e, LoggerEnum.MONGODB);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getAppConfigs(): Promise<AppConfig[]> {
    try {
      const appConfig = await this.appConfigModel.find();
      Logger.log('Get settings appConfig from mongoDB', LoggerEnum.EDULUTIONAPI);
      return appConfig;
    } catch (e) {
      Logger.error(e, LoggerEnum.MONGODB);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async deleteConfig(configName: string) {
    try {
      await this.appConfigModel.deleteOne({ name: configName });
      Logger.log(`Delete ${configName} entry in apps collection`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.error(e, LoggerEnum.MONGODB);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }
}

export default AppConfigService;
