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
vi.mock('@libs/classManagement/utils/getSchoolPrefix', () => ({
  default: (user: { sophomorixSchoolPrefix?: string }) => user.sophomorixSchoolPrefix || '',
}));

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useLmnApiStore from './useLmnApiStore';

const mockUser = {
  cn: 'max.mustermann',
  displayName: 'Max Mustermann',
  distinguishedName: 'CN=max.mustermann,OU=default-school',
  givenName: 'Max',
  sn: 'Mustermann',
  sAMAccountName: 'max.mustermann',
  sophomorixSchoolPrefix: 'default-school',
  sophomorixRole: 'student',
  homeDirectory: '/home/max',
  name: 'max.mustermann',
} as never;

const mockVersions = {
  'linuxmuster-base7': '7.2.0',
  'linuxmuster-api7': '7.2.1',
  'sophomorix-samba': '3.100.0',
} as never;

const mockQuota = {
  '/home': { used: 500, soft_limit: 1000, hard_limit: 2000 },
};

const initialStoreState = useLmnApiStore.getState();

describe('useLmnApiStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useLmnApiStore.setState(initialStoreState, true);
  });

  describe('setLmnApiToken', () => {
    it('sets lmnApiToken on success', async () => {
      server.use(http.get('/edu-api/lmn-api/auth', () => HttpResponse.json('test-token-123')));

      await useLmnApiStore.getState().setLmnApiToken();

      expect(useLmnApiStore.getState().lmnApiToken).toBe('test-token-123');
      expect(useLmnApiStore.getState().isLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('/edu-api/lmn-api/auth', () =>
          HttpResponse.json({ message: 'auth.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useLmnApiStore.getState().setLmnApiToken();

      expect(useLmnApiStore.getState().lmnApiToken).toBe('');
      expect(useLmnApiStore.getState().isLoading).toBe(false);
      expect(useLmnApiStore.getState().error).toBeTruthy();
    });
  });

  describe('getOwnUser', () => {
    it('fetches own user and sets schoolPrefix on success', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(http.get('/edu-api/lmn-api/user', () => HttpResponse.json(mockUser)));

      await useLmnApiStore.getState().getOwnUser();

      expect(useLmnApiStore.getState().user).toEqual(mockUser);
      expect(useLmnApiStore.getState().schoolPrefix).toBe('default-school');
      expect(useLmnApiStore.getState().isGetOwnUserLoading).toBe(false);
    });

    it('does nothing when lmnApiToken is empty', async () => {
      useLmnApiStore.setState({ lmnApiToken: '' });

      await useLmnApiStore.getState().getOwnUser();

      expect(useLmnApiStore.getState().user).toBeNull();
    });

    it('does nothing when already loading', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token', isGetOwnUserLoading: true });

      await useLmnApiStore.getState().getOwnUser();

      expect(useLmnApiStore.getState().user).toBeNull();
    });

    it('sets error state on failure', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.get('/edu-api/lmn-api/user', () =>
          HttpResponse.json({ message: 'user.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useLmnApiStore.getState().getOwnUser();

      expect(useLmnApiStore.getState().error).toBeTruthy();
      expect(useLmnApiStore.getState().isGetOwnUserLoading).toBe(false);
    });
  });

  describe('fetchUser', () => {
    it('returns user data on success', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(http.get('/edu-api/lmn-api/user/:username', () => HttpResponse.json(mockUser)));

      const result = await useLmnApiStore.getState().fetchUser('max.mustermann');

      expect(result).toEqual(mockUser);
      expect(useLmnApiStore.getState().isFetchUserLoading).toBe(false);
    });

    it('passes checkFirstPassword query parameter', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      let capturedUrl = '';
      server.use(
        http.get('/edu-api/lmn-api/user/:username', ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(mockUser);
        }),
      );

      await useLmnApiStore.getState().fetchUser('max.mustermann', true);

      expect(capturedUrl).toContain('checkFirstPassword=true');
    });

    it('returns null when already loading', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token', isFetchUserLoading: true });

      const result = await useLmnApiStore.getState().fetchUser('max.mustermann');

      expect(result).toBeNull();
    });

    it('returns null on failure', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.get('/edu-api/lmn-api/user/:username', () =>
          HttpResponse.json({ message: 'fetch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useLmnApiStore.getState().fetchUser('unknown');

      expect(result).toBeNull();
      expect(useLmnApiStore.getState().isFetchUserLoading).toBe(false);
    });
  });

  describe('fetchUsers', () => {
    it('returns user array on success', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(http.post('/edu-api/lmn-api/users', () => HttpResponse.json([mockUser])));

      const result = await useLmnApiStore.getState().fetchUsers(['max.mustermann']);

      expect(result).toEqual([mockUser]);
      expect(useLmnApiStore.getState().isFetchUserLoading).toBe(false);
    });

    it('returns empty array for empty input', async () => {
      const result = await useLmnApiStore.getState().fetchUsers([]);

      expect(result).toEqual([]);
    });

    it('returns empty array on failure', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.post('/edu-api/lmn-api/users', () =>
          HttpResponse.json({ message: 'fetch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useLmnApiStore.getState().fetchUsers(['unknown']);

      expect(result).toEqual([]);
      expect(useLmnApiStore.getState().isFetchUserLoading).toBe(false);
    });
  });

  describe('fetchUsersQuota', () => {
    it('sets usersQuota on success', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(http.get('/edu-api/lmn-api/user/:username/quotas', () => HttpResponse.json(mockQuota)));

      await useLmnApiStore.getState().fetchUsersQuota('max.mustermann');

      expect(useLmnApiStore.getState().usersQuota).toEqual(mockQuota);
      expect(useLmnApiStore.getState().isFetchUserLoading).toBe(false);
    });

    it('sets usersQuota to null on failure silently', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.get('/edu-api/lmn-api/user/:username/quotas', () =>
          HttpResponse.json({ message: 'quota.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useLmnApiStore.getState().fetchUsersQuota('max.mustermann');

      expect(useLmnApiStore.getState().usersQuota).toBeNull();
      expect(useLmnApiStore.getState().isFetchUserLoading).toBe(false);
    });
  });

  describe('patchUserDetails', () => {
    it('updates user on success', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      const updatedUser = { ...mockUser, givenName: 'Maximilian' };
      server.use(http.patch('/edu-api/lmn-api/user', () => HttpResponse.json(updatedUser)));

      await useLmnApiStore.getState().patchUserDetails({ sophomorixCustom1: 'value' } as never);

      expect(useLmnApiStore.getState().user).toEqual(updatedUser);
      expect(useLmnApiStore.getState().isPatchingUserLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.patch('/edu-api/lmn-api/user', () =>
          HttpResponse.json({ message: 'patch.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useLmnApiStore.getState().patchUserDetails({ sophomorixCustom1: 'value' } as never);

      expect(useLmnApiStore.getState().error).toBeTruthy();
      expect(useLmnApiStore.getState().isPatchingUserLoading).toBe(false);
    });
  });

  describe('getLmnVersion', () => {
    it('sets lmnVersions on success', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(http.get('/edu-api/lmn-api/server/lmnversion', () => HttpResponse.json(mockVersions)));

      await useLmnApiStore.getState().getLmnVersion();

      expect(useLmnApiStore.getState().lmnVersions).toEqual(mockVersions);
      expect(useLmnApiStore.getState().isGetVersionLoading).toBe(false);
    });

    it('sets error state on failure when not silent', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.get('/edu-api/lmn-api/server/lmnversion', () =>
          HttpResponse.json({ message: 'version.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useLmnApiStore.getState().getLmnVersion();

      expect(useLmnApiStore.getState().error).toBeTruthy();
      expect(useLmnApiStore.getState().isGetVersionLoading).toBe(false);
    });

    it('does not set error state on failure when silent', async () => {
      useLmnApiStore.setState({ lmnApiToken: 'valid-token' });

      server.use(
        http.get('/edu-api/lmn-api/server/lmnversion', () =>
          HttpResponse.json({ message: 'version.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useLmnApiStore.getState().getLmnVersion(true);

      expect(useLmnApiStore.getState().error).toBeNull();
      expect(useLmnApiStore.getState().isGetVersionLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('resets state to initial values', () => {
      useLmnApiStore.setState({
        lmnApiToken: 'some-token',
        user: mockUser,
        schoolPrefix: 'school-1',
        isLoading: true,
      });

      useLmnApiStore.getState().reset();

      const state = useLmnApiStore.getState();
      expect(state.lmnApiToken).toBe('');
      expect(state.user).toBeNull();
      expect(state.schoolPrefix).toBe('');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.usersQuota).toBeNull();
    });
  });
});
