import { Module } from '@nestjs/common';
import { FileDownloadController } from './webdav.controller';
import { FileDownloadService } from './webdav.service';
import { HttpModule } from '@nestjs/axios';
import { HttpService } from '@nestjs/axios';
@Module({
  imports: [HttpModule, HttpService],
  controllers: [FileDownloadController],
  providers: [FileDownloadService],
})
export class JwtGeneratorModule {}
