import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppConfigType } from './types/appconfig.types';
import LoggerEnum from '../types/logger';

@Injectable()
class AppConfigService {
  constructor(@InjectModel('AppConfig') private readonly appConfigModel: Model<AppConfigType>) {}

  async insertConfig(feConfig: AppConfigType[]) {
    try {
      await this.appConfigModel.insertMany(feConfig);
      Logger.log(`Wrote config to mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
  }

  async updateConfig(feConfig: AppConfigType[]) {
    try {
      const bulkOperations = feConfig.map((config) => ({
        updateOne: {
          filter: { name: config.name },
          update: { $set: { linkPath: config.linkPath, icon: config.icon, appType: config.appType } },
          upsert: true,
        },
      }));
      await this.appConfigModel.bulkWrite(bulkOperations);

      Logger.log(`Updated settings config at mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
  }

  async getConfig() {
    try {
      const settingsConfig = await this.appConfigModel.find();
      Logger.log('Get settings config from mongoDB', LoggerEnum.EDULUTIONAPI);
      return settingsConfig;
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
    return null;
  }

  async deleteConfig(configName: string) {
    try {
      await this.appConfigModel.deleteOne({ name: configName });
      Logger.log(`Delete ${configName} entry in apps collection`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
  }
}

export default AppConfigService;
