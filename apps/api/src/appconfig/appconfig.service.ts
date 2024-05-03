import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { AppConfigType } from './appconfig.types';
import LoggerEnum from '../types/logger';

@Injectable()
class AppConfigService {
  constructor(@InjectModel('AppConfig') private readonly appConfigModel: Model<AppConfigType>) {}

  async insertConfig(appConfigDto: AppConfigType[]) {
    try {
      await this.appConfigModel.insertMany(appConfigDto);
      Logger.log(`Wrote config to mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.error(e, LoggerEnum.MONGODB);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async updateConfig(appConfigDto: AppConfigType[]) {
    try {
      const bulkOperations = appConfigDto.map((config) => ({
        updateOne: {
          filter: { name: config.name },
          update: { $set: { linkPath: config.linkPath, icon: config.icon, appType: config.appType } },
          upsert: true,
        },
      }));
      await this.appConfigModel.bulkWrite(bulkOperations);

      Logger.log(`Updated settings config at mongoDB`, LoggerEnum.EDULUTIONAPI);
    } catch (e) {
      Logger.error(e, LoggerEnum.MONGODB);
      throw new HttpException(e instanceof Error ? e.message : String(e), HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async getConfig(): Promise<AppConfigType[]> {
    try {
      const appConfig = await this.appConfigModel.find();
      Logger.log('Get settings config from mongoDB', LoggerEnum.EDULUTIONAPI);
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
