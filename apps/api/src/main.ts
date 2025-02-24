/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import helmet from 'helmet';
import { JwtService } from '@nestjs/jwt';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import folderPaths from '@libs/common/constants/folderPaths';
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

  app.useGlobalPipes(
    new ValidationPipe({
      disableErrorMessages: true,
    }),
  );

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

  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap().catch((e) => Logger.log(e));
