import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import ConfigController from './config.controller';
import ConfigService from './config.service';
import ConfigSchema from './config.schema';
import AuthenticationModule from '../auth/auth.module';

@Module({
  imports: [
    AuthenticationModule,
    MongooseModule.forFeature([
      { name: 'Config', schema: ConfigSchema, collection: 'apps' },
      { name: 'Groups', schema: ConfigSchema, collection: 'groups' },
    ]),
  ],
  controllers: [ConfigController],
  providers: [ConfigService],
})
export default class ConfigModule {}
