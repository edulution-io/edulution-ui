/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import PUBLIC_DOWNLOADS_PATH from '@libs/common/constants/publicDownloadsPath';
import { BullModule } from '@nestjs/bullmq';
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
import TldrawSyncModule from '../tldraw-sync/tldraw-sync.module';
import FileSystemModule from '../filesystem/filesystem.module';
import WebDavModule from '../webdav/webdav.module';
import HealthModule from '../health/health.module';
import ScriptsModule from '../scripts/scripts.module';

const redisHost = process.env.REDIS_HOST ?? 'localhost';
const redisPort = +(process.env.REDIS_PORT ?? 6379);

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: PUBLIC_DOWNLOADS_PATH,
      serveRoot: `/${EDU_API_ROOT}/downloads`,
    }),

    BullModule.forRoot({
      connection: {
        host: redisHost,
        port: redisPort,
      },
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: true,
      },
    }),
    HealthModule,
    AuthModule,
    AppConfigModule,
    FileSystemModule,
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
    DockerModule,
    VeyonModule,
    GlobalSettingsModule,
    WebDavModule,
    SseModule,
    TldrawSyncModule,
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
        stores: [new KeyvRedis(`redis://${redisHost}:${redisPort}`)],
      }),
    }),

    EventEmitterModule.forRoot(),
    ScriptsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export default class AppModule {}
