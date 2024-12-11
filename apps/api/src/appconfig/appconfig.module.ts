import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import { AppConfig, AppConfigSchema } from './appconfig.schema';
import MigrationService from '../migration/migration.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppConfig.name, schema: AppConfigSchema }])],
  controllers: [AppConfigController],
  providers: [AppConfigService, MigrationService],
  exports: [AppConfigService],
})
export default class AppConfigModule {}
