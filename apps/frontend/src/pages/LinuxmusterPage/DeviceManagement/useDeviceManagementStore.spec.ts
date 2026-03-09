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

vi.mock('idb-keyval', () => ({
  get: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@libs/userManagement/utils/csvUtils', () => ({
  isCommentEntry: vi.fn((entry: Record<string, unknown>) => !!entry.isComment),
}));

import { toast } from 'sonner';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useLmnApiStore from '@/store/useLmnApiStore';
import useDeviceManagementStore from './useDeviceManagementStore';

const regularEntry = { room: 'r1', hostname: 'host1', mac: '00:11:22:33:44:55', ip: '10.0.0.1' };
const anotherEntry = { room: 'r2', hostname: 'host2', mac: 'aa:bb:cc:dd:ee:ff', ip: '10.0.0.2' };
const commentEntry = { isComment: true, text: '# comment line' };

const initialStoreState = useDeviceManagementStore.getState();

describe('useDeviceManagementStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useLmnApiStore.setState({ lmnApiToken: 'test-lmn-token' });
    useDeviceManagementStore.setState(initialStoreState, true);
  });

  describe('fetchDevices', () => {
    it('sets devices, savedDevices, and commentEntries on success', async () => {
      server.use(
        http.get('*/lmn-api/devices/list/:school', () => HttpResponse.json([regularEntry, anotherEntry, commentEntry])),
      );

      await useDeviceManagementStore.getState().fetchDevices('default-school');

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toHaveLength(2);
      expect(state.savedDevices).toHaveLength(2);
      expect(state.commentEntries).toHaveLength(1);
      expect(state.deletedIndices).toEqual([]);
      expect(state.isLoading).toBe(false);
    });

    it('separates comment entries from regular entries', async () => {
      server.use(http.get('*/lmn-api/devices/list/:school', () => HttpResponse.json([regularEntry, commentEntry])));

      await useDeviceManagementStore.getState().fetchDevices('default-school');

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toEqual([regularEntry]);
      expect(state.commentEntries).toEqual([commentEntry]);
    });

    it('sets isLoading true during fetch then false after', async () => {
      let resolveHandler!: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });

      server.use(
        http.get('*/lmn-api/devices/list/:school', async () => {
          await pending;
          return HttpResponse.json([regularEntry]);
        }),
      );

      const fetchPromise = useDeviceManagementStore.getState().fetchDevices('default-school');
      expect(useDeviceManagementStore.getState().isLoading).toBe(true);

      resolveHandler();
      await fetchPromise;

      expect(useDeviceManagementStore.getState().isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('*/lmn-api/devices/list/:school', () =>
          HttpResponse.json({ message: 'Server error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDeviceManagementStore.getState().fetchDevices('default-school');

      const state = useDeviceManagementStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isLoading).toBe(false);
    });

    it('does not fetch again when already loading', async () => {
      useDeviceManagementStore.setState({ isLoading: true });

      const fetchSpy = vi.fn(() => HttpResponse.json([regularEntry]));
      server.use(http.get('*/lmn-api/devices/list/:school', fetchSpy));

      await useDeviceManagementStore.getState().fetchDevices('default-school');

      expect(fetchSpy).not.toHaveBeenCalled();
    });
  });

  describe('fetchDevices background mode', () => {
    it('sets isBackgroundFetching instead of isLoading when devices are cached', async () => {
      useDeviceManagementStore.setState({
        devices: [regularEntry],
        savedDevices: [regularEntry],
        deletedIndices: [],
      });

      let resolveHandler!: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveHandler = resolve;
      });

      server.use(
        http.get('*/lmn-api/devices/list/:school', async () => {
          await pending;
          return HttpResponse.json([regularEntry]);
        }),
      );

      const fetchPromise = useDeviceManagementStore.getState().fetchDevices('default-school');
      expect(useDeviceManagementStore.getState().isBackgroundFetching).toBe(true);
      expect(useDeviceManagementStore.getState().isLoading).toBe(false);

      resolveHandler();
      await fetchPromise;

      expect(useDeviceManagementStore.getState().isBackgroundFetching).toBe(false);
    });

    it('updates savedDevices and commentEntries without overwriting devices when unsaved changes exist', async () => {
      const modifiedEntry = { room: 'r1', hostname: 'host1-modified', mac: '00:11:22:33:44:55', ip: '10.0.0.1' };
      useDeviceManagementStore.setState({
        devices: [modifiedEntry],
        savedDevices: [regularEntry],
        deletedIndices: [],
        commentEntries: [],
      });

      server.use(http.get('*/lmn-api/devices/list/:school', () => HttpResponse.json([anotherEntry, commentEntry])));

      await useDeviceManagementStore.getState().fetchDevices('default-school');

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toEqual([modifiedEntry]);
      expect(state.savedDevices).toEqual([anotherEntry]);
      expect(state.commentEntries).toEqual([commentEntry]);
    });

    it('does not re-fetch when already background fetching', async () => {
      useDeviceManagementStore.setState({
        devices: [regularEntry],
        savedDevices: [regularEntry],
        isBackgroundFetching: true,
      });

      const fetchSpy = vi.fn(() => HttpResponse.json([regularEntry]));
      server.use(http.get('*/lmn-api/devices/list/:school', fetchSpy));

      await useDeviceManagementStore.getState().fetchDevices('default-school');

      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('forces foreground fetch when force flag is true even with cached devices', async () => {
      useDeviceManagementStore.setState({
        devices: [regularEntry],
        savedDevices: [regularEntry],
        deletedIndices: [],
      });

      server.use(http.get('*/lmn-api/devices/list/:school', () => HttpResponse.json([anotherEntry])));

      await useDeviceManagementStore.getState().fetchDevices('default-school', true);

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toEqual([anotherEntry]);
      expect(state.savedDevices).toEqual([anotherEntry]);
    });
  });

  describe('saveDevices', () => {
    it('updates devices and savedDevices and shows toast on success', async () => {
      server.use(http.post('*/lmn-api/devices/list/:school', () => HttpResponse.json({})));

      await useDeviceManagementStore.getState().saveDevices('default-school', [regularEntry]);

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toEqual([regularEntry]);
      expect(state.savedDevices).toEqual([regularEntry]);
      expect(state.deletedIndices).toEqual([]);
      expect(state.isSaving).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('deviceManagement.listSaved');
    });

    it('includes commentEntries in the posted data', async () => {
      useDeviceManagementStore.setState({ commentEntries: [commentEntry] });

      let capturedBody: unknown;
      server.use(
        http.post('*/lmn-api/devices/list/:school', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({});
        }),
      );

      await useDeviceManagementStore.getState().saveDevices('default-school', [regularEntry]);

      expect(capturedBody).toEqual({ data: [commentEntry, regularEntry] });
    });

    it('does not show toast in silent mode', async () => {
      server.use(http.post('*/lmn-api/devices/list/:school', () => HttpResponse.json({})));

      await useDeviceManagementStore.getState().saveDevices('default-school', [regularEntry], true);

      expect(toast.success).not.toHaveBeenCalled();
    });

    it('sets error state on failure', async () => {
      server.use(
        http.post('*/lmn-api/devices/list/:school', () =>
          HttpResponse.json({ message: 'Save failed', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDeviceManagementStore.getState().saveDevices('default-school', [regularEntry]);

      const state = useDeviceManagementStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isSaving).toBe(false);
    });

    it('does not save again when already saving', async () => {
      useDeviceManagementStore.setState({ isSaving: true });

      const postSpy = vi.fn(() => HttpResponse.json({}));
      server.use(http.post('*/lmn-api/devices/list/:school', postSpy));

      await useDeviceManagementStore.getState().saveDevices('default-school', [regularEntry]);

      expect(postSpy).not.toHaveBeenCalled();
    });
  });

  describe('applyDevices', () => {
    it('saves devices then triggers import and shows toast on success', async () => {
      server.use(
        http.post('*/lmn-api/devices/list/:school', () => HttpResponse.json({})),
        http.get('*/lmn-api/devices/list/:school/import-devices', () => HttpResponse.json({})),
      );

      await useDeviceManagementStore.getState().applyDevices('default-school', [regularEntry]);

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toEqual([regularEntry]);
      expect(state.savedDevices).toEqual([regularEntry]);
      expect(state.deletedIndices).toEqual([]);
      expect(state.isApplying).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('deviceManagement.applyCompleted');
    });

    it('includes commentEntries in the posted data during apply', async () => {
      useDeviceManagementStore.setState({ commentEntries: [commentEntry] });

      let capturedBody: unknown;
      server.use(
        http.post('*/lmn-api/devices/list/:school', async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({});
        }),
        http.get('*/lmn-api/devices/list/:school/import-devices', () => HttpResponse.json({})),
      );

      await useDeviceManagementStore.getState().applyDevices('default-school', [regularEntry]);

      expect(capturedBody).toEqual({ data: [commentEntry, regularEntry] });
    });

    it('sets error state on POST failure', async () => {
      server.use(
        http.post('*/lmn-api/devices/list/:school', () =>
          HttpResponse.json({ message: 'Apply failed', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDeviceManagementStore.getState().applyDevices('default-school', [regularEntry]);

      const state = useDeviceManagementStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isApplying).toBe(false);
    });

    it('sets error state on import GET failure', async () => {
      server.use(
        http.post('*/lmn-api/devices/list/:school', () => HttpResponse.json({})),
        http.get('*/lmn-api/devices/list/:school/import-devices', () =>
          HttpResponse.json({ message: 'Import failed', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useDeviceManagementStore.getState().applyDevices('default-school', [regularEntry]);

      const state = useDeviceManagementStore.getState();
      expect(state.error).toBeTruthy();
      expect(state.isApplying).toBe(false);
      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('setDeviceEntries', () => {
    it('sets devices to the provided entries', () => {
      useDeviceManagementStore.getState().setDeviceEntries([regularEntry, anotherEntry]);

      expect(useDeviceManagementStore.getState().devices).toEqual([regularEntry, anotherEntry]);
    });

    it('replaces existing devices', () => {
      useDeviceManagementStore.setState({ devices: [regularEntry] });

      useDeviceManagementStore.getState().setDeviceEntries([anotherEntry]);

      expect(useDeviceManagementStore.getState().devices).toEqual([anotherEntry]);
    });
  });

  describe('setCommentEntries', () => {
    it('sets commentEntries to the provided entries', () => {
      useDeviceManagementStore.getState().setCommentEntries([commentEntry]);

      expect(useDeviceManagementStore.getState().commentEntries).toEqual([commentEntry]);
    });

    it('replaces existing commentEntries', () => {
      useDeviceManagementStore.setState({ commentEntries: [commentEntry] });
      const newComment = { isComment: true, text: '# another comment' };

      useDeviceManagementStore.getState().setCommentEntries([newComment]);

      expect(useDeviceManagementStore.getState().commentEntries).toEqual([newComment]);
    });
  });

  describe('addDeletedIndex', () => {
    it('appends the index to deletedIndices', () => {
      useDeviceManagementStore.getState().addDeletedIndex(3);

      expect(useDeviceManagementStore.getState().deletedIndices).toEqual([3]);
    });

    it('accumulates multiple deleted indices', () => {
      useDeviceManagementStore.getState().addDeletedIndex(1);
      useDeviceManagementStore.getState().addDeletedIndex(5);
      useDeviceManagementStore.getState().addDeletedIndex(9);

      expect(useDeviceManagementStore.getState().deletedIndices).toEqual([1, 5, 9]);
    });
  });

  describe('reset', () => {
    it('returns state to initial values', async () => {
      server.use(http.get('*/lmn-api/devices/list/:school', () => HttpResponse.json([regularEntry, commentEntry])));

      await useDeviceManagementStore.getState().fetchDevices('default-school');
      useDeviceManagementStore.getState().addDeletedIndex(0);

      expect(useDeviceManagementStore.getState().devices.length).toBeGreaterThan(0);

      useDeviceManagementStore.getState().reset();

      const state = useDeviceManagementStore.getState();
      expect(state.devices).toEqual([]);
      expect(state.savedDevices).toEqual([]);
      expect(state.commentEntries).toEqual([]);
      expect(state.deletedIndices).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isBackgroundFetching).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.isApplying).toBe(false);
      expect(state.error).toBeNull();
    });
  });
});
