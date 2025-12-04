/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import KeyvRedis from '@keyv/redis';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { Response } from 'express';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import PUBLIC_ASSET_PATH from '@libs/common/constants/publicAssetPath';
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
import DockerModule from '../docker/docker.module';
import VeyonModule from '../veyon/veyon.module';
import GlobalSettingsModule from '../global-settings/global-settings.module';
import SseModule from '../sse/sse.module';
import TLDrawSyncModule from '../tldraw-sync/tldraw-sync.module';
import FileSystemModule from '../filesystem/filesystem.module';
import WebDavModule from '../webdav/webdav.module';
import HealthModule from '../health/health.module';
import ScriptsModule from '../scripts/scripts.module';
import WebdavSharesModule from '../webdav/shares/webdav-shares.module';
import LdapKeycloakSyncModule from '../ldap-keycloak-sync/ldap-keycloak-sync.module';
import redisConnection from '../common/redis.connection';
import MobileAppModule from '../mobileAppModule/mobileApp.module';
import UserPreferencesModule from '../user-preferences/user-preferences.module';
import DevCacheFlushService from '../common/cache/dev-cache-flush.service';
import MetricsModule from '../metrics/metrics.module';
import configuration from '../config/configuration';
import enableSentryForNest from '../sentry/enableSentryForNest';
import AiModule from '../ai/ai.module';
import QueueModule from '../queue/queue.module';
import NotificationModule from '../notifications/notifications.module';

@Module({
  imports: [
    ...enableSentryForNest(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
      minPoolSize: 10,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [new KeyvRedis(`redis://${redisConnection.host}:${redisConnection.port}`)],
      }),
    }),
    BullModule.forRoot({
      connection: redisConnection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_DOWNLOADS_PATH,
      serveRoot: `/${EDU_API_ROOT}/downloads`,
    }),
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_ASSET_PATH,
      serveRoot: `/${EDU_API_ROOT}/public/assets`,
      serveStaticOptions: {
        setHeaders: (res: Response) => {
          res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
        },
      },
    }),

    HealthModule,
    MetricsModule,
    AuthModule,
    AppConfigModule,
    GlobalSettingsModule,
    UsersModule,
    GroupsModule,
    UserPreferencesModule,
    FileSystemModule,
    WebDavModule,
    WebdavSharesModule,
    FilesharingModule,
    LmnApiModule,
    LdapKeycloakSyncModule,
    ConferencesModule,
    MailsModule,
    VdiModule,
    DockerModule,
    VeyonModule,
    LicenseModule,
    SurveysModule,
    BulletinCategoryModule,
    BulletinBoardModule,
    NotificationModule,
    MobileAppModule,
    UserPreferencesModule,
    AiModule,
    QueueModule,
    JwtModule.register({
      global: true,
    }),
    MongooseModule.forRoot(process.env.MONGODB_SERVER_URL as string, {
      dbName: process.env.MONGODB_DATABASE_NAME,
      auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
    }),

    ScheduleModule.forRoot(),

    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [new KeyvRedis(`redis://${redisConnection.host}:${redisConnection.port}`)],
      }),
    }),

    EventEmitterModule.forRoot(),
    SseModule,
    TLDrawSyncModule,
    ScriptsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    ...(process.env.NODE_ENV === 'development' ? [DevCacheFlushService] : []),
  ],
})
export default class AppModule {}
