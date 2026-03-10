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

import { toast } from 'sonner';

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

import copyToClipboard from './copyToClipboard';

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls toast.info with success key when clipboard writeText succeeds', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    copyToClipboard('https://example.com');

    await vi.waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('common.copy.success');
    });
  });

  it('calls toast.error with error key when clipboard writeText fails', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
    });

    copyToClipboard('https://example.com');

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('common.copy.error');
    });
  });

  it('calls toast.error immediately when clipboard is not available', () => {
    Object.assign(navigator, {
      clipboard: { writeText: undefined },
    });

    copyToClipboard('https://example.com');

    expect(toast.error).toHaveBeenCalledWith('common.copy.error');
  });

  it('uses custom toasterTranslationIds for success message', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });

    copyToClipboard('https://example.com', {
      success: 'custom.copy.success',
      error: 'custom.copy.error',
    });

    await vi.waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('custom.copy.success');
    });
  });

  it('uses custom toasterTranslationIds for error message', async () => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('fail')) },
    });

    copyToClipboard('https://example.com', {
      success: 'custom.copy.success',
      error: 'custom.copy.error',
    });

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('custom.copy.error');
    });
  });
});
