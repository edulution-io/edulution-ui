import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import MailsController from './mails.controller';
import PasswordService from '../users/password.service';
import { User, UserSchema } from '../users/user.schema';
import AppConfigModule from '../appconfig/appconfig.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), AppConfigModule],
  controllers: [MailsController],
  providers: [PasswordService],
})
export default class MailsModule {}
