import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { ConfigType } from '../types/schema';
import LoggerEnum from '../types/logger';

@Injectable()
class ConfigService {
  constructor(@InjectModel('Config') private readonly ConfigModel: Model<ConfigType>) {}

  async insertConfig(feConfig: ConfigType[]) {
    try {
      await this.ConfigModel.insertMany(feConfig);
      Logger.log(`Wrote config to mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
  }

  async updateConfig(feConfig: ConfigType[]) {
    try {
      const bulkOperations = feConfig.map((config) => ({
        updateOne: {
          filter: { name: config.name },
          update: { $set: { linkPath: config.linkPath, icon: config.icon, appType: config.appType } },
          upsert: true,
        },
      }));
      await this.ConfigModel.bulkWrite(bulkOperations);

      Logger.log(`Updated settings config at mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
  }

  async getConfig() {
    try {
      const settingsConfig = await this.ConfigModel.find();
      Logger.log('Get settings config from mongoDB', LoggerEnum.EDULUTIONAPI);
      return settingsConfig;
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
    return null;
  }

  async deleteConfig(configName: string) {
    try {
      await this.ConfigModel.deleteOne({ name: configName });
      Logger.log(`Delete ${configName} entry in apps collection`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.log(e, LoggerEnum.MONGODB);
    }
  }
}

export default ConfigService;
