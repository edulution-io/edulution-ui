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

import { ExceptionFilter, Catch, ArgumentsHost, Logger, HttpStatus, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';
import MAXIMUM_JSON_BODY_SIZE from '@libs/common/constants/maximumJsonBodySize';
import sendPayloadTooLargeResponse from './sendPayloadTooLargeResponse';

interface ExpressHttpError extends Error {
  status?: number;
  statusCode?: number;
  type?: string;
  expose?: boolean;
  limit?: number;
}

@Catch()
class ExpressHttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(ExpressHttpErrorFilter.name);

  catch(exception: ExpressHttpError, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      throw exception;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isStaticFileError =
      exception?.message?.includes('res.sendFile') ||
      exception?.message?.includes('path must be absolute') ||
      request.url.startsWith('/edu-api/public/');

    if (isStaticFileError) {
      this.logger.warn(`Static file not found: ${request.method} ${request.url.split('?')[0]}`);

      return response.status(404).json({
        statusCode: 404,
        message: 'File not found',
        path: request.url,
      });
    }

    if (exception.name === 'PayloadTooLargeError') {
      const limit = exception.limit || MAXIMUM_JSON_BODY_SIZE;
      return sendPayloadTooLargeResponse(response, this.logger, 'json_body', limit);
    }

    const status = exception.status || exception.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;

    this.logger.error(`${exception.name}: ${request.method} ${request.url.split('?')[0]} - ${exception.message}`);

    return response.status(status).json({
      statusCode: status,
      message: exception.message || HttpStatus[status] || 'Internal Server Error',
      error: exception.name || 'Error',
    });
  }
}

export default ExpressHttpErrorFilter;
