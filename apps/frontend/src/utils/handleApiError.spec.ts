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

import { AxiosError, AxiosHeaders, HttpStatusCode } from 'axios';
import { toast } from 'sonner';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

import handleApiError from './handleApiError';

describe('handleApiError', () => {
  const mockSet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runAllTimers();
    vi.useRealTimers();
  });

  const createAxiosError = (message: string, status?: number, data?: Record<string, unknown>, name = 'AxiosError') => {
    const error = new AxiosError(message, undefined, undefined, undefined, {
      status: status ?? 500,
      statusText: 'Internal Server Error',
      data: data ?? { message },
      headers: {},
      config: { headers: new AxiosHeaders() },
    });
    error.name = name;
    return error;
  };

  it('sets error state with message from response data for Axios errors', () => {
    const error = createAxiosError('server.error.message');
    handleApiError(error, mockSet);

    expect(mockSet).toHaveBeenCalledWith({ error: 'server.error.message' });
  });

  it('shows toast.error for Axios errors', () => {
    const error = createAxiosError('server.error.unique1');
    handleApiError(error, mockSet);

    expect(toast.error).toHaveBeenCalledWith('server.error.unique1');
  });

  it('handles PayloadTooLarge with file_upload errorType', () => {
    const error = createAxiosError('', HttpStatusCode.PayloadTooLarge, {
      message: '',
      errorType: 'file_upload',
    });
    handleApiError(error, mockSet);

    expect(mockSet).toHaveBeenCalledWith({ error: 'errors.fileTooLarge' });
  });

  it('handles PayloadTooLarge without errorType', () => {
    const error = createAxiosError('', HttpStatusCode.PayloadTooLarge, { message: '' });
    handleApiError(error, mockSet);

    expect(mockSet).toHaveBeenCalledWith({ error: 'errors.requestTooLarge' });
  });

  it('returns early for CanceledError', () => {
    const error = createAxiosError('canceled', 0, undefined, 'CanceledError');
    handleApiError(error, mockSet);

    expect(mockSet).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('returns early for ERR_CANCELED error code', () => {
    const error = new AxiosError('canceled', 'ERR_CANCELED');
    handleApiError(error, mockSet);

    expect(mockSet).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('handles non-Axios errors with console.error and unexpectedError', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Something went wrong');
    handleApiError(error, mockSet);

    expect(consoleSpy).toHaveBeenCalledWith('Something went wrong');
    expect(mockSet).toHaveBeenCalledWith({ error: 'errors.unexpectedError' });
    consoleSpy.mockRestore();
  });

  it('uses custom errorName when provided', () => {
    const error = createAxiosError('custom.error.unique2');
    handleApiError(error, mockSet, 'customError');

    expect(mockSet).toHaveBeenCalledWith({ customError: 'custom.error.unique2' });
  });

  it('deduplicates same error message within duration', () => {
    const error1 = createAxiosError('duplicate.error');
    const error2 = createAxiosError('duplicate.error');

    handleApiError(error1, mockSet);
    handleApiError(error2, mockSet);

    expect(toast.error).toHaveBeenCalledTimes(1);
  });

  it('allows same error message after duration expires', () => {
    const error1 = createAxiosError('timed.error');
    handleApiError(error1, mockSet);

    vi.runAllTimers();

    const error2 = createAxiosError('timed.error');
    handleApiError(error2, mockSet);

    expect(toast.error).toHaveBeenCalledTimes(2);
  });
});
