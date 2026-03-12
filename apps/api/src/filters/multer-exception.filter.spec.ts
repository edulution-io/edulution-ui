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

import { HttpStatus } from '@nestjs/common';
import { MulterError } from 'multer';
import { createMockArgumentsHost } from '@libs/test-utils/api-mocks';
import MAXIMUM_UPLOAD_FILE_SIZE from '@libs/common/constants/maximumUploadFileSize';
import MulterExceptionFilter from './multer-exception.filter';

describe(MulterExceptionFilter.name, () => {
  let filter: MulterExceptionFilter;

  beforeEach(() => {
    filter = new MulterExceptionFilter();
  });

  it('should respond with 415 for LIMIT_UNEXPECTED_FILE error', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new MulterError('LIMIT_UNEXPECTED_FILE');

    filter.catch(error, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'common.errors.invalidFileType',
      errorType: 'file_upload',
    });
  });

  it('should respond with 422 for LIMIT_FILE_SIZE error', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new MulterError('LIMIT_FILE_SIZE');

    filter.catch(error, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'common.errors.fileTooLarge',
      limit: MAXIMUM_UPLOAD_FILE_SIZE,
      errorType: 'file_size',
    });
  });

  it('should respond with 400 for LIMIT_FIELD_KEY error', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new MulterError('LIMIT_FIELD_KEY');

    filter.catch(error, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: error.message,
    });
  });

  it('should respond with 400 for LIMIT_FIELD_VALUE error', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new MulterError('LIMIT_FIELD_VALUE');

    filter.catch(error, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should respond with 400 for LIMIT_FIELD_COUNT error', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new MulterError('LIMIT_FIELD_COUNT');

    filter.catch(error, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });

  it('should respond with 400 for LIMIT_PART_COUNT error', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new MulterError('LIMIT_PART_COUNT');

    filter.catch(error, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
  });
});
