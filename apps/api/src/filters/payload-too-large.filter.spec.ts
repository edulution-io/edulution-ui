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

import { HttpStatus, PayloadTooLargeException } from '@nestjs/common';
import { createMockArgumentsHost } from '@libs/test-utils/api-mocks';
import PayloadTooLargeFilter from './payload-too-large.filter';

describe(PayloadTooLargeFilter.name, () => {
  let filter: PayloadTooLargeFilter;

  beforeEach(() => {
    filter = new PayloadTooLargeFilter();
  });

  it('should respond with 413 and file_upload error type when message contains "file too large"', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new PayloadTooLargeException('File too large');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        errorType: 'file_upload',
      }),
    );
  });

  it('should respond with 413 and json_body error type when message does not contain "file too large"', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new PayloadTooLargeException('Payload too large');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        errorType: 'json_body',
      }),
    );
  });

  it('should handle exception with empty message as json_body', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new PayloadTooLargeException('');

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        errorType: 'json_body',
      }),
    );
  });

  it('should include the standard response fields in every response', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new PayloadTooLargeException('Payload too large');

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: expect.any(Number) as number,
        message: expect.any(String) as string,
        error: expect.any(String) as string,
        errorType: expect.any(String) as string,
      }),
    );
  });
});
