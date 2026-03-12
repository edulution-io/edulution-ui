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
import mailHandlers from '@libs/test-utils/msw/handlers/mailHandlers';
import useMailsStore from './useMailsStore';

const initialStoreState = useMailsStore.getState();

describe('useMailsStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    server.use(...mailHandlers);
    useMailsStore.setState(initialStoreState, true);
  });

  describe('getMails', () => {
    it('populates mails and sets isLoading to false on success', async () => {
      await useMailsStore.getState().getMails();

      const state = useMailsStore.getState();
      expect(state.mails).toHaveLength(2);
      expect(state.mails[0]).toEqual(expect.objectContaining({ id: 'mail-1', subject: 'Test Mail 1' }));
      expect(state.isLoading).toBe(false);
    });

    it('sets isLoading to false and error state on error', async () => {
      server.use(
        http.get('/edu-api/mails', () =>
          HttpResponse.json({ message: 'mails.fetch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useMailsStore.getState().getMails();

      const state = useMailsStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeTruthy();
    });
  });

  describe('getExternalMailProviderConfig', () => {
    it('populates externalMailProviderConfig on success', async () => {
      await useMailsStore.getState().getExternalMailProviderConfig();

      const state = useMailsStore.getState();
      expect(state.externalMailProviderConfig).toHaveLength(1);
      expect(state.externalMailProviderConfig[0]).toEqual(expect.objectContaining({ id: 'provider-1' }));
      expect(state.isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('/edu-api/mails/provider-config', () =>
          HttpResponse.json({ message: 'provider.config.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useMailsStore.getState().getExternalMailProviderConfig();

      expect(useMailsStore.getState().isLoading).toBe(false);
      expect(useMailsStore.getState().mailProviderConfigError).toBeTruthy();
    });
  });

  describe('postExternalMailProviderConfig', () => {
    it('updates externalMailProviderConfig on success', async () => {
      const config = { id: 'provider-2', host: 'imap.other.de', port: 993, username: 'other@test.de' };

      await useMailsStore.getState().postExternalMailProviderConfig(config as never);

      const state = useMailsStore.getState();
      expect(state.externalMailProviderConfig).toHaveLength(2);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('deleteExternalMailProviderConfig', () => {
    it('updates externalMailProviderConfig on success', async () => {
      await useMailsStore.getState().deleteExternalMailProviderConfig('provider-1');

      const state = useMailsStore.getState();
      expect(state.externalMailProviderConfig).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('getSyncJob', () => {
    it('populates syncJobs on success', async () => {
      await useMailsStore.getState().getSyncJob();

      const state = useMailsStore.getState();
      expect(state.syncJobs).toHaveLength(1);
      expect(state.syncJobs[0]).toEqual(expect.objectContaining({ id: 'sync-1' }));
      expect(state.isGetSyncJobLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('/edu-api/mails/sync-job', () =>
          HttpResponse.json({ message: 'sync.job.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useMailsStore.getState().getSyncJob();

      expect(useMailsStore.getState().isGetSyncJobLoading).toBe(false);
      expect(useMailsStore.getState().mailProviderConfigError).toBeTruthy();
    });
  });

  describe('postSyncJob', () => {
    it('populates syncJobs and shows toast on success', async () => {
      await useMailsStore.getState().postSyncJob({ mailProviderId: 'provider-2' } as never);

      const state = useMailsStore.getState();
      expect(state.syncJobs).toHaveLength(2);
      expect(state.isEditSyncJobLoading).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('mail.importer.syncAccountAdded');
    });
  });

  describe('deleteSyncJobs', () => {
    it('clears syncJobs and shows toast on success', async () => {
      await useMailsStore.getState().deleteSyncJobs(['sync-1']);

      const state = useMailsStore.getState();
      expect(state.syncJobs).toEqual([]);
      expect(state.isEditSyncJobLoading).toBe(false);
      expect(toast.success).toHaveBeenCalledWith('mail.importer.syncAccountDeleted');
    });
  });

  describe('setSelectedSyncJob', () => {
    it('updates selectedSyncJob state', () => {
      useMailsStore.getState().setSelectedSyncJob({ 0: true });

      expect(useMailsStore.getState().selectedSyncJob).toEqual({ 0: true });
    });
  });

  describe('reset', () => {
    it('returns loading and config state to initial values', () => {
      useMailsStore.setState({
        isLoading: true,
        externalMailProviderConfig: [{ id: 'x' }] as never,
        syncJobs: [{ id: 's' }] as never,
      });

      const { reset } = useMailsStore.getState();
      reset();

      const state = useMailsStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.externalMailProviderConfig).toEqual([]);
      expect(state.syncJobs).toEqual([]);
      expect(state.error).toBeNull();
    });
  });
});
