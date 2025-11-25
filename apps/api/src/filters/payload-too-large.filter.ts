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

import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger, PayloadTooLargeException } from '@nestjs/common';
import { Response } from 'express';
import MAXIMUM_UPLOAD_FILE_SIZE from '@libs/common/constants/maximumUploadFileSize';

@Catch(PayloadTooLargeException)
class PayloadTooLargeFilter implements ExceptionFilter {
  private readonly logger = new Logger(PayloadTooLargeFilter.name);

  catch(_exception: PayloadTooLargeException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const limitInMB = (MAXIMUM_UPLOAD_FILE_SIZE / 1024 / 1024).toFixed(2);

    this.logger.error(`Payload too large: limit is ${limitInMB}MB`);

    response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
      statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
      message: 'Request payload is too large',
      error: 'Payload Too Large',
    });
  }
}

export default PayloadTooLargeFilter;
