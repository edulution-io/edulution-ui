import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/contants/cacheTtl';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersModule from '../users/users.module';
import ConferencesModule from '../conferences/conferences.module';
import GroupsModule from '../groups/groups.module';
import LmnApiModule from '../lmnApi/lmnApi.module';
import LoggingInterceptor from '../logging/logging.interceptor';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    GroupsModule,
    LmnApiModule,
    ConferencesModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),

    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      ttl: DEFAULT_CACHE_TTL_MS,
      socket: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export default class AppModule {}
