import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import AIController from './ai.controller';
import AIService from './ai.service';
import AiConfigService from './ai.config.service';
import McpModule from '../mcp/mcp.module';
import ChatModule from '../chat/chat.module';
import AiConfig, { AiConfigSchema } from './schemas/ai.config.schema';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: AiConfig.name, schema: AiConfigSchema }]), McpModule, ChatModule],
  controllers: [AIController],
  providers: [AIService, AiConfigService],
  exports: [AIService, AiConfigService],
})
export default class AiModule {}
