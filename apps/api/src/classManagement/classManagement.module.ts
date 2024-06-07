import { Module } from '@nestjs/common';
import ClassManagementService from './classManagement.service';
import { ClassManagementController } from './classManagement.controller';

@Module({
  providers: [ClassManagementService],
  controllers: [ClassManagementController],
})
export default class ClassManagementModule {}
