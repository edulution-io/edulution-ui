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

import { HttpStatus, NotFoundException } from '@nestjs/common';
import { createMockArgumentsHost } from '@libs/test-utils/api-mocks';
import NotFoundFilter from './not-found.filter';

describe(NotFoundFilter.name, () => {
  let filter: NotFoundFilter;

  beforeEach(() => {
    filter = new NotFoundFilter();
  });

  it('should respond with 404 and correct JSON body', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new NotFoundException();

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Not Found',
      error: 'Not Found',
    });
  });

  it('should respond with 404 for a POST request', () => {
    const { host, mockResponse } = createMockArgumentsHost({ method: 'POST', url: '/unknown-route' });
    const exception = new NotFoundException();

    filter.catch(exception, host);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it('should include the correct response shape with statusCode, message, and error fields', () => {
    const { host, mockResponse } = createMockArgumentsHost();
    const exception = new NotFoundException();

    filter.catch(exception, host);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: expect.any(Number) as number,
        message: expect.any(String) as string,
        error: expect.any(String) as string,
      }),
    );
  });
});
