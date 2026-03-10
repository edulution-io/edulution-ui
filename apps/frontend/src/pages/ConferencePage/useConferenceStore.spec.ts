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

import { toast } from 'sonner';
import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import conferenceHandlers from '@libs/test-utils/msw/handlers/conferenceHandlers';
import useConferenceStore from './useConferenceStore';

describe('useConferenceStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    server.use(...conferenceHandlers);
    useConferenceStore.getState().reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('getConferences', () => {
    it('populates conferences and runningConferences on success', async () => {
      await useConferenceStore.getState().getConferences();

      const state = useConferenceStore.getState();
      expect(state.conferences).toHaveLength(2);
      expect(state.runningConferences).toHaveLength(1);
      expect(state.runningConferences[0].meetingID).toBe('meeting-2');
      expect(state.isLoading).toBe(false);
    });

    it('sets conferences to empty array and error state on failure', async () => {
      server.use(
        http.get('/edu-api/conferences', () =>
          HttpResponse.json({ message: 'conferences.fetch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useConferenceStore.getState().getConferences();

      const state = useConferenceStore.getState();
      expect(state.conferences).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('setConferences', () => {
    it('filters running conferences correctly', () => {
      useConferenceStore
        .getState()
        .setConferences([
          { meetingID: 'a', isRunning: true } as never,
          { meetingID: 'b', isRunning: false } as never,
          { meetingID: 'c', isRunning: true } as never,
        ]);

      const state = useConferenceStore.getState();
      expect(state.conferences).toHaveLength(3);
      expect(state.runningConferences).toHaveLength(2);
    });
  });

  describe('deleteConferences', () => {
    it('updates conferences and clears selectedRows on success', async () => {
      const toDelete = [{ meetingID: 'meeting-1', name: 'Conference A' }];

      await useConferenceStore.getState().deleteConferences(toDelete as never);

      const state = useConferenceStore.getState();
      expect(state.conferences).toHaveLength(1);
      expect(state.selectedRows).toEqual({});
      expect(state.isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.delete('/edu-api/conferences', () =>
          HttpResponse.json({ message: 'conferences.delete.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useConferenceStore.getState().deleteConferences([{ meetingID: 'x' }] as never);

      expect(useConferenceStore.getState().isLoading).toBe(false);
      expect(useConferenceStore.getState().error).toBeTruthy();
    });
  });

  describe('toggleConferenceRunningState', () => {
    it('returns true on success and sets loadingMeetingId', async () => {
      const result = await useConferenceStore.getState().toggleConferenceRunningState('meeting-1', false);

      expect(result).toBe(true);
      expect(toast.info).toHaveBeenCalledWith('conferences.isStarting');

      vi.advanceTimersByTime(6000);
      expect(useConferenceStore.getState().loadingMeetingId).toBeNull();
    });

    it('returns false and sets toggleConferenceRunningStateError on failure', async () => {
      server.use(
        http.put('/edu-api/conferences', () =>
          HttpResponse.json({ message: 'conferences.toggle.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useConferenceStore.getState().toggleConferenceRunningState('meeting-1', true);

      expect(result).toBe(false);
      expect(toast.info).toHaveBeenCalledWith('conferences.isStopping');
      expect(useConferenceStore.getState().toggleConferenceRunningStateError).toBeTruthy();
    });
  });

  describe('setIsDeleteConferencesDialogOpen', () => {
    it('updates dialog open state', () => {
      useConferenceStore.getState().setIsDeleteConferencesDialogOpen(true);
      expect(useConferenceStore.getState().isDeleteConferencesDialogOpen).toBe(true);

      useConferenceStore.getState().setIsDeleteConferencesDialogOpen(false);
      expect(useConferenceStore.getState().isDeleteConferencesDialogOpen).toBe(false);
    });
  });

  describe('setSelectedRows', () => {
    it('updates selectedRows state', () => {
      useConferenceStore.getState().setSelectedRows({ 0: true, 1: true });
      expect(useConferenceStore.getState().selectedRows).toEqual({ 0: true, 1: true });
    });
  });

  describe('reset', () => {
    it('returns state to initial values', async () => {
      await useConferenceStore.getState().getConferences();
      expect(useConferenceStore.getState().conferences.length).toBeGreaterThan(0);

      useConferenceStore.getState().reset();

      const state = useConferenceStore.getState();
      expect(state.conferences).toEqual([]);
      expect(state.runningConferences).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.loadingMeetingId).toBeNull();
    });
  });
});
