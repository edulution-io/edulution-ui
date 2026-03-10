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

import { BadRequestException, HttpException, HttpStatus, InternalServerErrorException, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { createMockArgumentsHost } from '@libs/test-utils/api-mocks';
import CustomHttpException from '../common/CustomHttpException';
import HttpExceptionFilter from './http-exception.filter';

describe(HttpExceptionFilter.name, () => {
  let filter: HttpExceptionFilter;
  let mockHttpAdapterHost: HttpAdapterHost;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockHttpAdapterHost = {
      httpAdapter: {
        reply: jest.fn(),
        isHeadersSent: jest.fn().mockReturnValue(false),
        getRequestUrl: jest.fn().mockReturnValue('/test'),
        getRequestMethod: jest.fn().mockReturnValue('GET'),
        getType: jest.fn().mockReturnValue('express'),
        status: jest.fn(),
        end: jest.fn(),
        render: jest.fn(),
        redirect: jest.fn(),
        setHeader: jest.fn(),
        setErrorHandler: jest.fn(),
        setNotFoundHandler: jest.fn(),
        setViewEngine: jest.fn(),
        useStaticAssets: jest.fn(),
        useBodyParser: jest.fn(),
        enableCors: jest.fn(),
        registerParserMiddleware: jest.fn(),
        getInstance: jest.fn(),
        getHttpServer: jest.fn(),
        close: jest.fn(),
        listen: jest.fn(),
        init: jest.fn(),
      },
    } as unknown as HttpAdapterHost;

    filter = new HttpExceptionFilter(mockHttpAdapterHost);

    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('should log a warning for 4xx exceptions and call super.catch', () => {
    const { host } = createMockArgumentsHost();
    const exception = new BadRequestException('Bad input');

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('400'));
  });

  it('should log an error for 5xx exceptions and call super.catch', () => {
    const { host } = createMockArgumentsHost();
    const exception = new InternalServerErrorException('Server broke');

    filter.catch(exception, host);

    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('500'));
  });

  it('should not log when exception is a CustomHttpException', () => {
    const { host } = createMockArgumentsHost();
    const exception = new CustomHttpException('test.errors.custom' as never, HttpStatus.BAD_REQUEST);

    filter.catch(exception, host);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should include the HTTP method and URL in the log message', () => {
    const { host } = createMockArgumentsHost({ method: 'POST', url: '/api/users?page=1' });
    const exception = new BadRequestException('Validation failed');

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('POST'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('/api/users'));
  });

  it('should strip query parameters from the URL in the log message', () => {
    const { host } = createMockArgumentsHost({ url: '/api/data?secret=123' });
    const exception = new BadRequestException('Bad');

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(expect.not.stringContaining('secret=123'));
  });

  it('should handle HttpException with object response', () => {
    const { host } = createMockArgumentsHost();
    const exception = new HttpException({ message: 'Custom message', error: 'Custom' }, HttpStatus.FORBIDDEN);

    filter.catch(exception, host);

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Custom message'));
  });
});
