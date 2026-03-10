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

const { mockToast, mockToastDismiss, mockToastError } = vi.hoisted(() => {
  const toastFn = vi.fn();
  toastFn.dismiss = vi.fn();
  toastFn.error = vi.fn();
  return { mockToast: toastFn, mockToastDismiss: toastFn.dismiss, mockToastError: toastFn.error };
});

vi.mock('sonner', () => ({
  toast: mockToast,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));

vi.mock('@/components/ui/ProgressBox', () => ({
  default: () => null,
}));

vi.mock('@/pages/FileSharing/utilities/filesharingUtilities', () => ({
  formatBytes: (bytes: number) => `${bytes}B`,
}));

vi.mock('@libs/filesharing/utils/formatTransferSpeed', () => ({
  default: () => '100 KB/s',
}));

vi.mock('@libs/filesharing/utils/formatEstimatedTimeRemaining', () => ({
  default: () => '5s',
}));

vi.mock('@libs/filesharing/utils/aggregateUploadProgress', () => ({
  default: vi.fn(() => ({
    overallPercentage: 50,
    failedFiles: 0,
    hasActiveUploads: true,
    totalLoadedBytes: 500,
    webdavShare: 'default',
    isCreatingDirectories: false,
  })),
}));

vi.mock('@libs/filesharing/utils/formatProgressToastMessage', () => ({
  default: vi.fn(() => ({
    title: 'Uploading files',
    description: '500B / 1000B',
  })),
}));

import { renderHook } from '@testing-library/react';
import useHandleUploadFileStore from '@/pages/FileSharing/Dialog/upload/useHandleUploadFileStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import aggregateUploadProgress from '@libs/filesharing/utils/aggregateUploadProgress';
import useUploadProgressToast from './useUploadProgressToast';

const mockAggregateUploadProgress = vi.mocked(aggregateUploadProgress);

describe('useUploadProgressToast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useHandleUploadFileStore.setState({
      progressById: {},
      totalFilesCount: 0,
      totalBytesCount: 0,
      clearProgress: vi.fn(),
    } as never);
    useFileSharingStore.setState({
      currentPath: '/',
      fetchFiles: vi.fn(),
    } as never);
  });

  it('dismisses the toast and resets when progressById is empty', () => {
    useHandleUploadFileStore.setState({ progressById: {} } as never);

    renderHook(() => useUploadProgressToast());

    expect(mockToastDismiss).toHaveBeenCalledWith('upload:combined');
  });

  it('shows a progress toast when upload is in progress', () => {
    useHandleUploadFileStore.setState({
      progressById: { file1: { share: 'default', fileName: 'file.txt', progress: { loaded: 500, total: 1000 } } },
      totalFilesCount: 1,
      totalBytesCount: 1000,
      clearProgress: vi.fn(),
    } as never);

    mockAggregateUploadProgress.mockReturnValue({
      overallPercentage: 50,
      failedFiles: 0,
      hasActiveUploads: true,
      totalLoadedBytes: 500,
      webdavShare: 'default',
      isCreatingDirectories: false,
    } as never);

    renderHook(() => useUploadProgressToast());

    expect(mockToast).toHaveBeenCalledTimes(1);
    expect(mockToast).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        id: 'upload:combined',
      }),
    );
  });

  it('shows an error toast when upload has failures and no active uploads', () => {
    useHandleUploadFileStore.setState({
      progressById: { file1: { share: 'default', fileName: 'file.txt', progress: { loaded: 0, total: 1000 } } },
      totalFilesCount: 1,
      totalBytesCount: 1000,
      clearProgress: vi.fn(),
    } as never);

    mockAggregateUploadProgress.mockReturnValue({
      overallPercentage: 0,
      failedFiles: 1,
      hasActiveUploads: false,
      totalLoadedBytes: 0,
      webdavShare: 'default',
      isCreatingDirectories: false,
    } as never);

    renderHook(() => useUploadProgressToast());

    expect(mockToastDismiss).toHaveBeenCalledWith('upload:combined');
    expect(mockToastError).toHaveBeenCalled();
  });

  it('clears progress and refreshes files when upload completes at 100%', () => {
    const clearProgressMock = vi.fn();
    const fetchFilesMock = vi.fn();

    useHandleUploadFileStore.setState({
      progressById: { file1: { share: 'default', fileName: 'file.txt', progress: { loaded: 1000, total: 1000 } } },
      totalFilesCount: 1,
      totalBytesCount: 1000,
      clearProgress: clearProgressMock,
    } as never);

    useFileSharingStore.setState({
      currentPath: '/uploads',
      fetchFiles: fetchFilesMock,
    } as never);

    mockAggregateUploadProgress.mockReturnValue({
      overallPercentage: 100,
      failedFiles: 0,
      hasActiveUploads: false,
      totalLoadedBytes: 1000,
      webdavShare: 'default',
      isCreatingDirectories: false,
    } as never);

    renderHook(() => useUploadProgressToast());

    expect(clearProgressMock).toHaveBeenCalled();
    expect(fetchFilesMock).toHaveBeenCalledWith('default', '/uploads');
  });
});
