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
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/components/ui/ProgressBox', () => ({
  default: () => null,
}));

import { renderHook } from '@testing-library/react';
import type FilesharingProgressDto from '@libs/filesharing/types/filesharingProgressDto';
import useFileOperationProgressToast from './useFileOperationProgressToast';

describe('useFileOperationProgressToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not show a toast when progress is null', () => {
    renderHook(() => useFileOperationProgressToast(null));

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('does not show a toast when progress is undefined', () => {
    renderHook(() => useFileOperationProgressToast(undefined));

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('does not show a toast when percent is 0', () => {
    const progress = {
      processID: 1,
      title: 'copying',
      percent: 0,
    } as FilesharingProgressDto;

    renderHook(() => useFileOperationProgressToast(progress));

    expect(mockToast).not.toHaveBeenCalled();
  });

  it('shows a toast when progress has a non-zero percent', () => {
    const progress = {
      processID: 1,
      title: 'copying',
      description: 'file.txt',
      percent: 50,
      currentFilePath: '/path/to/file.txt',
      processed: 5,
      total: 10,
    } as FilesharingProgressDto;

    renderHook(() => useFileOperationProgressToast(progress));

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'copying',
        duration: Infinity,
      }),
    );
  });

  it('updates toast when progress changes', () => {
    const progress1 = {
      processID: 1,
      title: 'copying',
      percent: 30,
      currentFilePath: '/a/b.txt',
    } as FilesharingProgressDto;

    const progress2 = {
      processID: 1,
      title: 'copying',
      percent: 60,
      currentFilePath: '/a/c.txt',
    } as FilesharingProgressDto;

    const { rerender } = renderHook(({ progress }) => useFileOperationProgressToast(progress), {
      initialProps: { progress: progress1 as FilesharingProgressDto | null },
    });

    expect(mockToast).toHaveBeenCalledTimes(1);

    rerender({ progress: progress2 });

    expect(mockToast).toHaveBeenCalledTimes(2);
  });

  it('uses DONE_TOAST_DURATION_MS when percent is 100', () => {
    const progress = {
      processID: 1,
      title: 'copying',
      percent: 100,
      processed: 10,
      total: 10,
    } as FilesharingProgressDto;

    renderHook(() => useFileOperationProgressToast(progress));

    expect(mockToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 1000,
      }),
    );
  });

  it('uses ERROR_TOAST_DURATION_MS when there are failed paths', () => {
    const progress = {
      processID: 1,
      title: 'copying',
      percent: 50,
      failedPaths: ['/path/failed.txt'],
    } as FilesharingProgressDto;

    renderHook(() => useFileOperationProgressToast(progress));

    expect(mockToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        duration: 10000,
      }),
    );
  });
});
