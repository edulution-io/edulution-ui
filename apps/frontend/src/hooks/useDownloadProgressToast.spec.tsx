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

const { mockToast } = vi.hoisted(() => ({
  mockToast: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: mockToast,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, unknown>) => (opts ? `${key}:${JSON.stringify(opts)}` : key),
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

vi.mock('@/components/ui/ProgressBox', () => ({
  default: () => null,
}));

vi.mock('@/pages/FileSharing/utilities/filesharingUtilities', () => ({
  formatBytes: (bytes: number) => `${bytes}B`,
}));

import { renderHook } from '@testing-library/react';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useDownloadProgressToast from './useDownloadProgressToast';

describe('useDownloadProgressToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useFileSharingDownloadStore.setState({ downloadProgress: {} as never });
  });

  it('does not show a toast when downloadProgress is empty', () => {
    renderHook(() => useDownloadProgressToast());

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('does not show a toast when fileName is missing', () => {
    useFileSharingDownloadStore.setState({
      downloadProgress: {
        processId: 1,
        percent: 50,
        fileName: '',
      } as never,
    });

    renderHook(() => useDownloadProgressToast());

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('shows a toast when download progress has valid data with recent timestamp', () => {
    const now = Date.now();
    useFileSharingDownloadStore.setState({
      downloadProgress: {
        processId: 1,
        fileName: 'test.zip',
        percent: 50,
        lastUpdateAt: now + 100,
        loadedBytes: 500,
        totalBytes: 1000,
        speedFormatted: '100 KB/s',
        etaFormatted: '5s',
      } as never,
    });

    renderHook(() => useDownloadProgressToast());

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'download:test.zip:1',
        duration: Infinity,
      }),
    );
  });

  it('uses DONE_TOAST_DURATION_MS when percent reaches 100', () => {
    const now = Date.now();
    useFileSharingDownloadStore.setState({
      downloadProgress: {
        processId: 2,
        fileName: 'done.zip',
        percent: 100,
        lastUpdateAt: now + 100,
        loadedBytes: 1000,
        totalBytes: 1000,
      } as never,
    });

    renderHook(() => useDownloadProgressToast());

    expect(mockToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 1000,
      }),
    );
  });

  it('does not show a toast when lastUpdateAt is before mount time', () => {
    useFileSharingDownloadStore.setState({
      downloadProgress: {
        processId: 3,
        fileName: 'old.zip',
        percent: 50,
        lastUpdateAt: 1,
        loadedBytes: 500,
        totalBytes: 1000,
      } as never,
    });

    renderHook(() => useDownloadProgressToast());

    expect(mockToast).not.toHaveBeenCalled();
  });
});
