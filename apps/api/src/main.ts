import { Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import helmet from 'helmet';
import { JwtService } from '@nestjs/jwt';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import TRAEFIK_CONFIG_FILES_PATH from '@libs/common/constants/traefikConfigPath';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';

import AppModule from './app/app.module';
import AuthenticationGuard from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: process.env.EDUI_CORS_URL },
  });
  const globalPrefix = EDU_API_ROOT;
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.EDUI_PORT || 3000;
  app.set('trust proxy', true);

  app.use(helmet());

  const reflector = new Reflector();
  app.useGlobalGuards(new AuthenticationGuard(new JwtService(), reflector));

  if (!existsSync(TRAEFIK_CONFIG_FILES_PATH)) {
    mkdirSync(TRAEFIK_CONFIG_FILES_PATH, { recursive: true });
  }

  if (process.env.NODE_ENV === 'production' && !existsSync(APPS_FILES_PATH)) {
    mkdirSync(APPS_FILES_PATH, { recursive: true });
  }

  if (process.env.NODE_ENV === 'development') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('edulution-api')
      .setDescription('Test API for edulution-io')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    writeFileSync('./swagger-spec.json', JSON.stringify(swaggerDocument));
    SwaggerModule.setup('/docs', app, swaggerDocument);
  }

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap().catch((e) => Logger.log(e));
