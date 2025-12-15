import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import AppModule from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();

  const port = configService.get<number>('MCP_PORT', 3002);
  await app.listen(port);
  Logger.log(`MCP Server running on http://localhost:${port}`);
}

void bootstrap();
