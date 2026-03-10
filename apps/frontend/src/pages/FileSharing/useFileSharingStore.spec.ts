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

vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@libs/filesharing/utils/processWebdavResponse', () => ({
  default: (data: unknown[]) => data,
}));

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import fileSharingHandlers from '@libs/test-utils/msw/handlers/fileSharingHandlers';
import useFileSharingStore from './useFileSharingStore';

const initialStoreState = useFileSharingStore.getState();

describe('useFileSharingStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    server.use(...fileSharingHandlers);
    useFileSharingStore.setState(initialStoreState, true);
  });

  describe('fetchFiles', () => {
    it('populates files and resets selection on success', async () => {
      await useFileSharingStore.getState().fetchFiles('share1', '/');

      const state = useFileSharingStore.getState();
      expect(state.files).toHaveLength(2);
      expect(state.currentPath).toBe('/');
      expect(state.selectedItems).toEqual([]);
      expect(state.selectedRows).toEqual({});
      expect(state.isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('/edu-api/filesharing', () =>
          HttpResponse.json({ message: 'filesharing.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useFileSharingStore.getState().fetchFiles('share1', '/');

      const state = useFileSharingStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('fetchWebdavShares', () => {
    it('populates webdavShares on success', async () => {
      const result = await useFileSharingStore.getState().fetchWebdavShares();

      const state = useFileSharingStore.getState();
      expect(state.webdavShares).toHaveLength(2);
      expect(result).toHaveLength(2);
      expect(state.isWebdavSharesLoading).toBe(false);
    });

    it('returns existing shares on error', async () => {
      server.use(
        http.get('/edu-api/webdav-shares', () =>
          HttpResponse.json({ message: 'webdav.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useFileSharingStore.getState().fetchWebdavShares();

      expect(result).toEqual([]);
      expect(useFileSharingStore.getState().isWebdavSharesLoading).toBe(false);
    });
  });

  describe('setCurrentPath', () => {
    it('updates currentPath', () => {
      useFileSharingStore.getState().setCurrentPath('/documents/subfolder');
      expect(useFileSharingStore.getState().currentPath).toBe('/documents/subfolder');
    });
  });

  describe('setSelectedItems', () => {
    it('updates selectedItems', () => {
      const items = [{ filename: 'test.pdf', basename: 'test.pdf', type: 'file' }] as never;
      useFileSharingStore.getState().setSelectedItems(items);
      expect(useFileSharingStore.getState().selectedItems).toEqual(items);
    });
  });

  describe('downloadProgress', () => {
    it('updateDownloadProgress adds new entry', () => {
      useFileSharingStore.getState().updateDownloadProgress({ fileName: 'a.zip', progress: 50 } as never);

      expect(useFileSharingStore.getState().downloadProgressList).toHaveLength(1);
    });

    it('updateDownloadProgress updates existing entry', () => {
      useFileSharingStore.getState().updateDownloadProgress({ fileName: 'a.zip', progress: 50 } as never);
      useFileSharingStore.getState().updateDownloadProgress({ fileName: 'a.zip', progress: 100 } as never);

      const list = useFileSharingStore.getState().downloadProgressList;
      expect(list).toHaveLength(1);
      expect(list[0]).toEqual(expect.objectContaining({ progress: 100 }));
    });

    it('removeDownloadProgress removes entry by fileName', () => {
      useFileSharingStore.getState().updateDownloadProgress({ fileName: 'a.zip', progress: 100 } as never);
      useFileSharingStore.getState().removeDownloadProgress('a.zip');

      expect(useFileSharingStore.getState().downloadProgressList).toEqual([]);
    });
  });

  describe('setFileOperationProgress', () => {
    it('sets and clears progress', () => {
      useFileSharingStore.getState().setFileOperationProgress({ progress: 75 } as never);
      expect(useFileSharingStore.getState().fileOperationProgress).toEqual({ progress: 75 });

      useFileSharingStore.getState().setFileOperationProgress(null);
      expect(useFileSharingStore.getState().fileOperationProgress).toBeNull();
    });
  });

  describe('clearFilesOnShareChange', () => {
    it('resets file-related state', () => {
      useFileSharingStore.setState({
        files: [{ filename: 'x.pdf' }] as never,
        selectedItems: [{ filename: 'x.pdf' }] as never,
        currentPath: '/some/path',
      });

      useFileSharingStore.getState().clearFilesOnShareChange();

      const state = useFileSharingStore.getState();
      expect(state.files).toEqual([]);
      expect(state.selectedItems).toEqual([]);
      expect(state.selectedRows).toEqual({});
      expect(state.currentPath).toBe('/');
      expect(state.isLoading).toBe(true);
    });
  });

  describe('reset', () => {
    it('returns state to initial values', () => {
      useFileSharingStore.setState({
        files: [{ filename: 'x.pdf' }] as never,
        currentPath: '/some/path',
        isLoading: true,
      });

      useFileSharingStore.getState().reset();

      const state = useFileSharingStore.getState();
      expect(state.files).toEqual([]);
      expect(state.currentPath).toBe('/');
      expect(state.isLoading).toBe(false);
      expect(state.webdavShares).toEqual([]);
    });
  });
});
