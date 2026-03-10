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

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useUserPreferencesStore from './useUserPreferencesStore';

const mockPreferences = {
  username: 'max.mustermann',
  collapsedBulletins: { 'bulletin-1': true },
  bulletinBoardGridRows: '3',
};

const initialStoreState = useUserPreferencesStore.getState();

describe('useUserPreferencesStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserPreferencesStore.setState(initialStoreState, true);
  });

  describe('getUserPreferences', () => {
    it('fetches and stores preferences on success', async () => {
      server.use(http.get('/edu-api/user-preferences', () => HttpResponse.json(mockPreferences)));

      const result = await useUserPreferencesStore
        .getState()
        .getUserPreferences(['collapsedBulletins', 'bulletinBoardGridRows']);

      expect(result).toEqual(mockPreferences);
      expect(useUserPreferencesStore.getState().preferences).toEqual(mockPreferences);
      expect(useUserPreferencesStore.getState().isLoading).toBe(false);
    });

    it('returns null and sets error on failure', async () => {
      server.use(
        http.get('/edu-api/user-preferences', () =>
          HttpResponse.json({ message: 'preferences.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useUserPreferencesStore.getState().getUserPreferences(['collapsedBulletins']);

      expect(result).toBeNull();
      expect(useUserPreferencesStore.getState().error).toBeTruthy();
      expect(useUserPreferencesStore.getState().isLoading).toBe(false);
    });

    it('sets isLoading to true during request', async () => {
      let resolveRequest: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.get('/edu-api/user-preferences', async () => {
          await pending;
          return HttpResponse.json(mockPreferences);
        }),
      );

      const promise = useUserPreferencesStore.getState().getUserPreferences(['collapsedBulletins']);

      expect(useUserPreferencesStore.getState().isLoading).toBe(true);

      resolveRequest!();
      await promise;

      expect(useUserPreferencesStore.getState().isLoading).toBe(false);
    });
  });

  describe('updateBulletinBoardGridRows', () => {
    it('sends patch request successfully', async () => {
      let capturedBody: unknown;
      server.use(
        http.patch('/edu-api/user-preferences/bulletin-board-grid-rows', async ({ request }) => {
          capturedBody = await request.json();
          return new HttpResponse(null, { status: 200 });
        }),
      );

      await useUserPreferencesStore.getState().updateBulletinBoardGridRows('5');

      expect(capturedBody).toEqual({ gridRows: '5' });
    });

    it('sets error on failure', async () => {
      server.use(
        http.patch('/edu-api/user-preferences/bulletin-board-grid-rows', () =>
          HttpResponse.json({ message: 'update.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useUserPreferencesStore.getState().updateBulletinBoardGridRows('5');

      expect(useUserPreferencesStore.getState().error).toBeTruthy();
    });
  });

  describe('reset', () => {
    it('resets state to initial values', async () => {
      server.use(http.get('/edu-api/user-preferences', () => HttpResponse.json(mockPreferences)));
      await useUserPreferencesStore.getState().getUserPreferences(['collapsedBulletins']);

      useUserPreferencesStore.getState().reset();

      expect(useUserPreferencesStore.getState().preferences).toBeNull();
      expect(useUserPreferencesStore.getState().isLoading).toBe(false);
      expect(useUserPreferencesStore.getState().error).toBeNull();
    });
  });
});
