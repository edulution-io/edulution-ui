import helmet from 'helmet';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';

import AppModule from './app/app.module';
import AuthenticationGuard from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: { origin: process.env.EDUI_CORS_URL },
  });
  const globalPrefix = 'edu-api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;

  app.use(helmet());
  app.useGlobalGuards(new AuthenticationGuard(new JwtService()));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('edulution-api')
    .setDescription('Test API for edulution-io')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap().catch((e) => Logger.log(e));
