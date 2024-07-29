import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import CleanUpRoutineService from './cleanUpRoutine.service';
import FileCleanupService from './fileCleanUp/file-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [],
  providers: [CleanUpRoutineService, FileCleanupService],
  exports: [CleanUpRoutineService],
})
export default class CleanUpRoutineModule {}
