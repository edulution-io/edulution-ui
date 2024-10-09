import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AuthService from './auth.service';
import AuthController from './auth.controller';
import { User, UserSchema } from '../users/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [AuthService],
})
export default class AuthModule {}
