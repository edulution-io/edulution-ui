import { Module } from '@nestjs/common';
import { DocumentController } from './document-generator.controller';
import { JwtGeneratorService } from './jwt-generator.service';

@Module({
  imports: [],
  controllers: [DocumentController],
  providers: [JwtGeneratorService],
})
export class JwtGeneratorModule {}
