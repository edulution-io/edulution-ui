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
import useGroupStore from './GroupStore';

const mockGroups = [
  {
    id: 'group-1',
    name: 'Teachers',
    path: '/teachers',
    subGroupCount: 0,
    subGroups: [],
    attributes: {},
    realmRoles: [],
    clientRoles: {},
    access: {},
  },
  {
    id: 'group-2',
    name: 'Students',
    path: '/students',
    subGroupCount: 0,
    subGroups: [],
    attributes: {},
    realmRoles: [],
    clientRoles: {},
    access: {},
  },
];

const initialStoreState = useGroupStore.getState();

describe('useGroupStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGroupStore.setState(initialStoreState, true);
  });

  describe('searchGroups', () => {
    it('returns formatted MultipleSelectorGroup array on success', async () => {
      server.use(http.get('/edu-api/groups', () => HttpResponse.json(mockGroups)));

      const result = await useGroupStore.getState().searchGroups('teach');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(expect.objectContaining({ value: 'group-1', label: 'Teachers' }));
      expect(result[1]).toEqual(expect.objectContaining({ value: 'group-2', label: 'Students' }));
      expect(useGroupStore.getState().searchGroupsIsLoading).toBe(false);
    });

    it('returns empty array when response is empty', async () => {
      server.use(http.get('/edu-api/groups', () => HttpResponse.json([])));

      const result = await useGroupStore.getState().searchGroups('nonexistent');

      expect(result).toEqual([]);
      expect(useGroupStore.getState().searchGroupsIsLoading).toBe(false);
    });

    it('returns empty array when response is not an array', async () => {
      server.use(http.get('/edu-api/groups', () => HttpResponse.json(null)));

      const result = await useGroupStore.getState().searchGroups('test');

      expect(result).toEqual([]);
    });

    it('returns empty array and sets error on failure', async () => {
      server.use(
        http.get('/edu-api/groups', () =>
          HttpResponse.json({ message: 'groups.search.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useGroupStore.getState().searchGroups('invalid');

      expect(result).toEqual([]);
      expect(useGroupStore.getState().searchGroupsError).toBeTruthy();
      expect(useGroupStore.getState().searchGroupsIsLoading).toBe(false);
    });

    it('sets searchGroupsIsLoading to true during request', async () => {
      let resolveRequest: () => void;
      const pending = new Promise<void>((resolve) => {
        resolveRequest = resolve;
      });

      server.use(
        http.get('/edu-api/groups', async () => {
          await pending;
          return HttpResponse.json(mockGroups);
        }),
      );

      const promise = useGroupStore.getState().searchGroups('teach');

      expect(useGroupStore.getState().searchGroupsIsLoading).toBe(true);

      resolveRequest!();
      await promise;

      expect(useGroupStore.getState().searchGroupsIsLoading).toBe(false);
    });
  });
});
