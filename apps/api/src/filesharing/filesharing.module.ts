import { Module } from '@nestjs/common';

import FilesharingController from './filesharing.controller';
import UsersModule from '../users/users.module';
import FilesharingService from './filesharing.service';

@Module({
  imports: [UsersModule],
  controllers: [FilesharingController],
  providers: [FilesharingService],
})
export default class FilesharingModule {}
