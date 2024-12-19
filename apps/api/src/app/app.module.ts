import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import LoggingInterceptor from '../logging/logging.interceptor';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
import GroupsModule from '../groups/groups.module';
import LmnApiModule from '../lmnApi/lmnApi.module';
import MailsModule from '../mails/mails.module';
import VdiModule from '../vdi/vdi.module';
import FilesharingModule from '../filesharing/filesharing.module';
import LicenseModule from '../license/license.module';
import SurveysModule from '../surveys/surveys.module';
import AuthModule from '../auth/auth.module';
import BulletinCategoryModule from '../bulletin-category/bulletin-category.module';
import BulletinBoardModule from '../bulletinboard/bulletinboard.module';
import VeyonModule from '../veyon/veyon.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_DOWNLOADS_PATH,
      serveRoot: `/${EDU_API_ROOT}/downloads`,
    }),
    AuthModule,
    AppConfigModule,
    UsersModule,
    GroupsModule,
    LmnApiModule,
    ConferencesModule,
    MailsModule,
    FilesharingModule,
    VdiModule,
    LicenseModule,
    SurveysModule,
    BulletinCategoryModule,
    BulletinBoardModule,
    VeyonModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),

    ScheduleModule.forRoot(),

    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      ttl: DEFAULT_CACHE_TTL_MS,
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),

    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export default class AppModule {}
