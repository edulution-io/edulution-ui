import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import AuthModule from 'src/auth/auth.module';
import UsersModule from 'src/users/users.module';
import AppConfigModule from '../appconfig/appconfig.module';
import ConferencesModule from '../conferences/conferences.module';
import FilemanagerModule from '../filemanager/filemanager.module.ts';
import ClassManagementModule from '../classManagement/classManagement.module.ts';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveRoot: '/',
    }),
    AppConfigModule,
    UsersModule,
    ConferencesModule,
    ClassManagementModule,
    FilemanagerModule,
    AuthModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),
  ],
})
export default class AppModule {}
