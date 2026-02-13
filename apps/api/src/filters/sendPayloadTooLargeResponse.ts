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

import { HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';

export type PayloadTooLargeErrorType = 'file_upload' | 'json_body';

const sendPayloadTooLargeResponse = (
  response: Response,
  logger: Logger,
  errorType: PayloadTooLargeErrorType,
  limit: number,
) => {
  const limitInMB = (limit / 1024 / 1024).toFixed(2);
  logger.warn(`Payload too large (${errorType}): limit is ${limitInMB}MB`);

  response.status(HttpStatus.PAYLOAD_TOO_LARGE).json({
    statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
    message: 'Request payload is too large',
    error: 'Payload Too Large',
    errorType,
  });
};

export default sendPayloadTooLargeResponse;
