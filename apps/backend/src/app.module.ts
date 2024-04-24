import { Module } from '@nestjs/common';
import { DocumentController } from './jwtOnlyOffice/document-generator.controller';
import { JwtGeneratorService } from './jwtOnlyOffice/jwt-generator.service';
import { FileDownloadController } from './webdav/webdav.controller';
import { FileDownloadService } from './webdav/webdav.service';
import { HttpModule } from '@nestjs/axios'; // Only HttpModule should be imported

@Module({
  imports: [HttpModule], // Correct this line
  controllers: [DocumentController, FileDownloadController],
  providers: [JwtGeneratorService, FileDownloadService],
})
export class AppModule {}
