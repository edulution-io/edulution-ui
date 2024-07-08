import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import UsersService from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.schema';
import DEFAULT_CACHE_TTL_MS from '../app/cache-ttl';

@Module({
  imports: [
    CacheModule.register({
      ttl: DEFAULT_CACHE_TTL_MS,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export default class UsersModule {}
