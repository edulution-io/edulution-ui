/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { ConsoleLogger, Logger } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import helmet from 'helmet';
import { JwtService } from '@nestjs/jwt';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import folderPaths from '@libs/common/constants/folderPaths';
import { WsAdapter } from '@nestjs/platform-ws';
import AppModule from './app/app.module';
import AuthGuard from './auth/auth.guard';
import getLogLevels from './logging/getLogLevels';
import PayloadTooLargeFilter from './filters/payload-too-large.filter';
import ExpressHttpErrorFilter from './filters/express-http-error.filter';
import NotFoundFilter from './filters/not-found.filter';
import HttpExceptionFilter from './filters/http-exception.filter';
import MulterExceptionFilter from './filters/multer-exception.filter';

async function bootstrap() {
  const globalPrefix = EDU_API_ROOT;
  const logLevels = getLogLevels(process.env.EDUI_LOG_LEVEL);
  const logger = logLevels
    ? new ConsoleLogger({
        prefix: globalPrefix,
        logLevels,
      })
    : false;

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: { origin: process.env.EDUI_CORS_URL },
    logger,
  });

  const configService = app.get(ConfigService);
  const version = configService.get<string>('version');

  app.setGlobalPrefix(globalPrefix);
  const port = process.env.EDUI_PORT || 3000;
  app.set('trust proxy', true);

  app.use(helmet());

  app.useGlobalFilters(
    new ExpressHttpErrorFilter(),
    new HttpExceptionFilter(),
    new PayloadTooLargeFilter(),
    new NotFoundFilter(),
    new MulterExceptionFilter(),
  );

  app.useWebSocketAdapter(new WsAdapter(app));

  const reflector = new Reflector();
  app.useGlobalGuards(new AuthGuard(new JwtService(), reflector));

  folderPaths.forEach((path) => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
    }
  });

  if (process.env.NODE_ENV === 'development') {
    if (existsSync('edulution.pem')) {
      copyFileSync('edulution.pem', 'data/edulution.pem');
    }
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

  await app.init();

  const server = app.getHttpServer();

  server.setTimeout?.(0);
  server.requestTimeout = 0;
  server.headersTimeout = 0;
  server.keepAliveTimeout = 0;

  await app.listen(port);
  if (logLevels) {
    Logger.log(`🚀 Application Version ${version} is running on: http://localhost:${port}/${globalPrefix}`);
    Logger.log(`Logging-Levels: ${logLevels.map((level) => level.toUpperCase()).join(', ')}`);
  } else {
    console.info(`Application is running on: http://localhost:${port}/${globalPrefix}`);
    console.info('Logging off');
  }
}

bootstrap().catch((e) => Logger.log(e));
