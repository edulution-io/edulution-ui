import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailsController from './mails.controller';
import { User, UserSchema } from '../users/user.schema';
import AppConfigModule from '../appconfig/appconfig.module';
import ImapService from './imap.service';
import UsersService from '../users/users.service';
import {CacheModule} from "@nestjs/cache-manager";
import DEFAULT_CACHE_TTL_MS from "../app/cache-ttl";
import GroupsModule from "../groups/groups.module";

@Module({
  imports: [
    CacheModule.register({
      ttl: DEFAULT_CACHE_TTL_MS,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AppConfigModule,
    GroupsModule,
  ],
  controllers: [MailsController],
  providers: [UsersService, ImapService],
})
export default class MailsModule {}
