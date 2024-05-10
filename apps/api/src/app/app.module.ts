import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import FilemanagerModule from '../filemanager/filemanager.module';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    ConferencesModule,
    JwtModule.register({
      global: true,
    }),
    FilemanagerModule,
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'edulution',
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),
  ],
})
export default class AppModule {}
