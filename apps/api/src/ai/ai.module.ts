import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import AiService from './ai.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [AiService],
  exports: [AiService],
})
class AiModule {}

export default AiModule;
