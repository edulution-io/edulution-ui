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

import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { MulterError } from 'multer';
import { Response } from 'express';
import MAXIMUM_UPLOAD_FILE_SIZE from '@libs/common/constants/maximumUploadFileSize';

@Catch(MulterError)
class MulterExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MulterError.name);

  catch(error: MulterError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    this.logger.warn(error.message);

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE).json({
        message: 'common.errors.invalidFileType',
        errorType: 'file_upload',
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        message: 'common.errors.fileTooLarge',
        limit: MAXIMUM_UPLOAD_FILE_SIZE,
        errorType: 'file_size',
      });
    }

    return res.status(HttpStatus.BAD_REQUEST).json({
      message: error.message,
    });
  }
}

export default MulterExceptionFilter;
