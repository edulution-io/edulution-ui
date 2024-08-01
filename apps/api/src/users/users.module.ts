import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import UsersService from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './user.schema';
import GroupsModule from '../groups/groups.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), GroupsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export default class UsersModule {}
