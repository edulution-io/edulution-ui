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
vi.mock('@libs/common/utils/getBase64String', () => ({
  decodeBase64: (data: string) => `decoded:${data}`,
}));

import { http, HttpResponse } from 'msw';
import server from '@libs/test-utils/msw/server';
import useUserStore from './useUserStore';

const mockUser = {
  username: 'max.mustermann',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max@test.de',
  role: 'teacher',
  language: 'de',
};

const initialStoreState = useUserStore.getState();

describe('useUserStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    useUserStore.setState(initialStoreState, true);
  });

  describe('UserSlice', () => {
    describe('setEduApiToken', () => {
      it('sets the eduApiToken', () => {
        useUserStore.getState().setEduApiToken('new-token-123');
        expect(useUserStore.getState().eduApiToken).toBe('new-token-123');
      });
    });

    describe('createOrUpdateUser', () => {
      it('sets user data and isAuthenticated on success', async () => {
        server.use(http.post('/edu-api/users', () => HttpResponse.json(mockUser)));

        const result = await useUserStore.getState().createOrUpdateUser(mockUser as never);

        expect(result).toEqual(mockUser);
        expect(useUserStore.getState().user).toEqual(mockUser);
        expect(useUserStore.getState().isAuthenticated).toBe(true);
        expect(useUserStore.getState().userIsLoading).toBe(false);
      });

      it('sets error state on failure', async () => {
        server.use(
          http.post('/edu-api/users', () =>
            HttpResponse.json({ message: 'user.create.error', statusCode: 500 }, { status: 500 }),
          ),
        );

        const result = await useUserStore.getState().createOrUpdateUser(mockUser as never);

        expect(result).toBeUndefined();
        expect(useUserStore.getState().userError).toBeTruthy();
        expect(useUserStore.getState().isAuthenticated).toBe(true);
      });
    });

    describe('getUser', () => {
      it('updates user data on success', async () => {
        useUserStore.setState({ user: mockUser as never });

        server.use(
          http.get('/edu-api/users/:username', () => HttpResponse.json({ ...mockUser, email: 'updated@test.de' })),
        );

        await useUserStore.getState().getUser();

        expect(useUserStore.getState().user?.email).toBe('updated@test.de');
        expect(useUserStore.getState().userIsLoading).toBe(false);
      });
    });

    describe('searchAttendees', () => {
      it('returns formatted attendee list on success', async () => {
        server.use(
          http.get('/edu-api/users/search/:param', () =>
            HttpResponse.json([{ username: 'alice', firstName: 'Alice', lastName: 'Wonderland' }]),
          ),
        );

        const result = await useUserStore.getState().searchAttendees('alice');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(expect.objectContaining({ value: 'alice', label: expect.stringContaining('Alice') }));
        expect(useUserStore.getState().searchIsLoading).toBe(false);
      });

      it('returns empty array on error', async () => {
        server.use(
          http.get('/edu-api/users/search/:param', () =>
            HttpResponse.json({ message: 'search.error', statusCode: 500 }, { status: 500 }),
          ),
        );

        const result = await useUserStore.getState().searchAttendees('invalid');

        expect(result).toEqual([]);
        expect(useUserStore.getState().searchIsLoading).toBe(false);
      });
    });

    describe('logout', () => {
      it('sets isPreparingLogout then isAuthenticated to false', async () => {
        useUserStore.setState({ isAuthenticated: true });

        await useUserStore.getState().logout();

        expect(useUserStore.getState().isAuthenticated).toBe(false);
      });
    });

    describe('resetUserSlice', () => {
      it('resets user state to initial values', () => {
        useUserStore.setState({
          isAuthenticated: true,
          eduApiToken: 'token',
          user: mockUser as never,
        });

        useUserStore.getState().resetUserSlice();

        const state = useUserStore.getState();
        expect(state.isAuthenticated).toBe(false);
        expect(state.eduApiToken).toBe('');
        expect(state.user).toBeNull();
      });
    });
  });

  describe('TotpSlice', () => {
    describe('setupTotp', () => {
      it('returns true and updates user on success', async () => {
        server.use(http.post('/edu-api/auth/totp', () => HttpResponse.json(mockUser)));

        const result = await useUserStore.getState().setupTotp('123456', 'secret-key');

        expect(result).toBe(true);
        expect(useUserStore.getState().user).toEqual(mockUser);
        expect(useUserStore.getState().totpIsLoading).toBe(false);
      });

      it('returns false on error', async () => {
        server.use(
          http.post('/edu-api/auth/totp', () =>
            HttpResponse.json({ message: 'totp.error', statusCode: 500 }, { status: 500 }),
          ),
        );

        const result = await useUserStore.getState().setupTotp('000000', 'bad-secret');

        expect(result).toBe(false);
        expect(useUserStore.getState().totpIsLoading).toBe(false);
      });
    });

    describe('getTotpStatus', () => {
      it('returns boolean status on success', async () => {
        server.use(http.get('/edu-api/auth/totp/:username', () => HttpResponse.json(true)));

        const result = await useUserStore.getState().getTotpStatus('max.mustermann');

        expect(result).toBe(true);
      });

      it('returns false when username is empty', async () => {
        const result = await useUserStore.getState().getTotpStatus('');
        expect(result).toBe(false);
      });
    });

    describe('resetTotpSlice', () => {
      it('resets totp state', () => {
        useUserStore.setState({ totpIsLoading: true, isSetTotpDialogOpen: true });

        useUserStore.getState().resetTotpSlice();

        expect(useUserStore.getState().totpIsLoading).toBe(false);
        expect(useUserStore.getState().isSetTotpDialogOpen).toBe(false);
      });
    });
  });

  describe('QrCodeSlice', () => {
    describe('getQrCode', () => {
      it('sets decoded qrCode on success', async () => {
        server.use(http.get('/edu-api/auth/qrcode', () => HttpResponse.json('base64QrData')));

        await useUserStore.getState().getQrCode();

        expect(useUserStore.getState().qrCode).toBe('decoded:base64QrData');
        expect(useUserStore.getState().qrCodeIsLoading).toBe(false);
      });
    });

    describe('resetQrCodeSlice', () => {
      it('resets qrCode state', () => {
        useUserStore.setState({ qrCode: 'some-data', qrCodeIsLoading: true });

        useUserStore.getState().resetQrCodeSlice();

        expect(useUserStore.getState().qrCode).toBe('');
        expect(useUserStore.getState().qrCodeIsLoading).toBe(false);
      });
    });
  });

  describe('UserAccountsSlice', () => {
    describe('getUserAccounts', () => {
      it('populates userAccounts on success', async () => {
        useUserStore.setState({ user: mockUser as never });

        server.use(
          http.get('/edu-api/users/:username/accounts', () =>
            HttpResponse.json([{ id: 'acc-1', provider: 'github', username: 'max-gh' }]),
          ),
        );

        await useUserStore.getState().getUserAccounts();

        expect(useUserStore.getState().userAccounts).toHaveLength(1);
        expect(useUserStore.getState().userAccountsIsLoading).toBe(false);
      });

      it('does nothing when user is undefined', async () => {
        useUserStore.setState({ user: null as never });

        await useUserStore.getState().getUserAccounts();

        expect(useUserStore.getState().userAccounts).toEqual([]);
      });
    });

    describe('addUserAccount', () => {
      it('updates userAccounts on success', async () => {
        useUserStore.setState({ user: mockUser as never });

        server.use(
          http.post('/edu-api/users/:username/accounts', () =>
            HttpResponse.json([
              { id: 'acc-1', provider: 'github', username: 'max-gh' },
              { id: 'acc-2', provider: 'gitlab', username: 'max-gl' },
            ]),
          ),
        );

        await useUserStore.getState().addUserAccount({ provider: 'gitlab', username: 'max-gl' } as never);

        expect(useUserStore.getState().userAccounts).toHaveLength(2);
        expect(useUserStore.getState().userAccountsIsLoading).toBe(false);
      });
    });

    describe('deleteUserAccount', () => {
      it('updates userAccounts on success', async () => {
        useUserStore.setState({ user: mockUser as never });

        server.use(http.delete('/edu-api/users/:username/accounts/:id', () => HttpResponse.json([])));

        await useUserStore.getState().deleteUserAccount('acc-1');

        expect(useUserStore.getState().userAccounts).toEqual([]);
        expect(useUserStore.getState().userAccountsIsLoading).toBe(false);
      });
    });

    describe('resetUserAccountsSlice', () => {
      it('resets user accounts state', () => {
        useUserStore.setState({
          userAccounts: [{ id: 'acc-1' }] as never,
          userAccountsIsLoading: true,
        });

        useUserStore.getState().resetUserAccountsSlice();

        expect(useUserStore.getState().userAccounts).toEqual([]);
        expect(useUserStore.getState().userAccountsIsLoading).toBe(false);
      });
    });
  });
});
