import { Module } from '@nestjs/common';
import { DocumentController } from './jwtOnlyOffice/document-generator.controller';
import { JwtGeneratorService } from './jwtOnlyOffice/jwt-generator.service';
import { FilemanagerController } from './FileManager/Filemanager.controller';
import { FileManagerService } from './FileManager/Filemanger.service';
import { HttpModule } from '@nestjs/axios';
import { WebDAVModule } from './FileManager/webdav/webdav.module';
import { FilemanagerModule } from './FileManager/Filemanger.module';

@Module({
  imports: [HttpModule, WebDAVModule, FilemanagerModule],
  controllers: [DocumentController, FilemanagerController],
  providers: [JwtGeneratorService, FileManagerService],
})
export class AppModule {}
