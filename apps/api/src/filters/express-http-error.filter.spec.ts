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

import { BadRequestException, HttpStatus } from '@nestjs/common';
import { createMockArgumentsHost } from '@libs/test-utils/api-mocks';
import ExpressHttpErrorFilter from './express-http-error.filter';

describe(ExpressHttpErrorFilter.name, () => {
  let filter: ExpressHttpErrorFilter;

  beforeEach(() => {
    filter = new ExpressHttpErrorFilter();
  });

  it('should re-throw HttpException instances', () => {
    const { host } = createMockArgumentsHost();
    const httpException = new BadRequestException('Bad request');

    expect(() => filter.catch(httpException as never, host)).toThrow(BadRequestException);
  });

  it('should respond with 404 for static file errors containing "res.sendFile"', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new Error('res.sendFile failed') as Error & { status?: number };

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'File not found',
      }),
    );
  });

  it('should respond with 404 for static file errors containing "path must be absolute"', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = new Error('path must be absolute') as Error & { status?: number };

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
  });

  it('should respond with 404 for requests to /edu-api/public/ path', () => {
    const { host, mockResponse } = createMockArgumentsHost({ url: '/edu-api/public/missing-file.txt' });
    const error = new Error('Some error') as Error & { status?: number };

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'File not found',
        path: '/edu-api/public/missing-file.txt',
      }),
    );
  });

  it('should respond with 413 for PayloadTooLargeError', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = Object.assign(new Error('entity too large'), { name: 'PayloadTooLargeError', limit: 1048576 });

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.PAYLOAD_TOO_LARGE);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        errorType: 'json_body',
      }),
    );
  });

  it('should respond with 500 for generic unknown errors', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = Object.assign(new Error('Something unexpected'), { name: 'UnknownError' });

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something unexpected',
        error: 'UnknownError',
      }),
    );
  });

  it('should use the error status property when available', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = Object.assign(new Error('Forbidden resource'), {
      name: 'ForbiddenError',
      status: 403,
    });

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
  });

  it('should use the error statusCode property when status is not available', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = Object.assign(new Error('Gone'), {
      name: 'GoneError',
      statusCode: 410,
    });

    filter.catch(error as never, host);

    expect(mockResponse.status).toHaveBeenCalledWith(410);
  });

  it('should not expose stack traces in the response', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const error = Object.assign(new Error('Crash'), { name: 'RuntimeError' });

    filter.catch(error as never, host);

    expect(mockResponse.json).not.toHaveBeenCalledWith(
      expect.objectContaining({ stack: expect.anything() as unknown }),
    );
  });
});
