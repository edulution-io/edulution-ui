import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AppConfigController from './appconfig.controller';
import AppConfigService from './appconfig.service';
import AppConfigSchema from './appconfig.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AppConfig', schema: AppConfigSchema, collection: 'apps' },
      { name: 'Groups', schema: AppConfigSchema, collection: 'groups' },
    ]),
  ],
  controllers: [AppConfigController],
  providers: [AppConfigService],
})
export default class AppConfigModule {}
