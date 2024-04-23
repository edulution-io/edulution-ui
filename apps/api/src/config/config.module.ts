import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ConfigController from './config.controller';
import ConfigService from './config.service';
import ConfigSchema from '../schemas/config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Config', schema: ConfigSchema, collection: 'apps' },
      { name: 'Groups', schema: ConfigSchema, collection: 'groups' },
    ]),
  ],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export default class ConfigModule {}
