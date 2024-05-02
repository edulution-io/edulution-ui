import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import AuthenticationModule from '../auth/auth.module';
import FilemanagerModule from '../filemanager/filemanager.module';
import ConfigModule from '../config/config.module';

@Module({
  imports: [
    AuthenticationModule,
    ConfigModule,
    FilemanagerModule,
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'settingsConfig',
      // auth: { username: 'root', password: 'example' },
    }),
  ],
})
export default class AppModule {}
