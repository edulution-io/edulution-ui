import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppConfig, AppConfigSchema } from './appconfig.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppConfig.name, schema: AppConfigSchema, collection: 'apps' }])],
  controllers: [AppConfigController],
  providers: [AppConfigService],
})
export default class AppConfigModule {}
