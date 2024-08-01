import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import VdiController from './vdi.controller';
import VdiService from './vdi.service';
import { User, UserSchema } from '../users/user.schema';
import UsersModule from '../users/users.module';
import AppConfigModule from '../appconfig/appconfig.module';
import UsersService from '../users/users.service';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';
import GroupsModule from '../groups/groups.module';

@Module({
  imports: [
    CacheModule.register({
      ttl: DEFAULT_CACHE_TTL_MS,
    }),
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AppConfigModule,
    GroupsModule,
  ],
  controllers: [VdiController],
  providers: [UsersService, VdiService],
})
export default class VdiModule {}
