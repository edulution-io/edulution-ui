import { Module } from '@nestjs/common';
import ClassManagementService from './classManagement.service';
import { ClassManagementController } from './classManagement.controller';
import GroupsModule from '../groups/groups.module';

@Module({
  imports: [GroupsModule],
  providers: [ClassManagementService],
  controllers: [ClassManagementController],
})
export default class ClassManagementModule {}
