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
import classManagementHandlers from '@libs/test-utils/msw/handlers/classManagementHandlers';
import useLmnApiStore from '@/store/useLmnApiStore';
import useClassManagementStore from './useClassManagementStore';

const initialStoreState = useClassManagementStore.getState();

describe('useClassManagementStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    server.use(...classManagementHandlers);
    useLmnApiStore.setState({ lmnApiToken: 'test-lmn-token' });
    useClassManagementStore.setState(initialStoreState, true);
  });

  describe('fetchUserSchoolClasses', () => {
    it('populates userSchoolClasses on success', async () => {
      await useClassManagementStore.getState().fetchUserSchoolClasses();

      const state = useClassManagementStore.getState();
      expect(state.userSchoolClasses).toHaveLength(2);
      expect(state.areSchoolClassesLoading).toBe(false);
    });

    it('sets error state on failure', async () => {
      server.use(
        http.get('/edu-api/lmn-api/school-classes', () =>
          HttpResponse.json({ message: 'classes.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useClassManagementStore.getState().fetchUserSchoolClasses();

      expect(useClassManagementStore.getState().areSchoolClassesLoading).toBe(false);
      expect(useClassManagementStore.getState().error).toBeTruthy();
    });
  });

  describe('fetchSchoolClass', () => {
    it('returns class with members on success', async () => {
      const result = await useClassManagementStore.getState().fetchSchoolClass('10a');

      expect(result).toBeTruthy();
      expect(result?.cn).toBe('10a');
      expect(result?.members).toHaveLength(1);
      expect(useClassManagementStore.getState().isSchoolClassLoading).toBe(false);
    });

    it('returns null on error', async () => {
      server.use(
        http.get('/edu-api/lmn-api/school-classes/:name', () =>
          HttpResponse.json({ message: 'class.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useClassManagementStore.getState().fetchSchoolClass('10a');

      expect(result).toBeNull();
      expect(useClassManagementStore.getState().isSchoolClassLoading).toBe(false);
    });
  });

  describe('fetchUserProjects', () => {
    it('populates userProjects on success', async () => {
      await useClassManagementStore.getState().fetchUserProjects();

      const state = useClassManagementStore.getState();
      expect(state.userProjects).toHaveLength(1);
      expect(state.areProjectsLoading).toBe(false);
    });
  });

  describe('fetchProject', () => {
    it('returns project with members on success', async () => {
      const result = await useClassManagementStore.getState().fetchProject('project-alpha');

      expect(result).toBeTruthy();
      expect(result?.cn).toBe('project-alpha');
      expect(useClassManagementStore.getState().isProjectLoading).toBe(false);
    });
  });

  describe('fetchUserSessions', () => {
    it('populates userSessions on success', async () => {
      const result = await useClassManagementStore.getState().fetchUserSessions(false);

      expect(result).toHaveLength(1);
      expect(useClassManagementStore.getState().areSessionsLoading).toBe(false);
    });
  });

  describe('fetchRoom', () => {
    it('sets userRoom on success', async () => {
      await useClassManagementStore.getState().fetchRoom();

      const state = useClassManagementStore.getState();
      expect(state.userRoom).toBeTruthy();
      expect(state.isRoomLoading).toBe(false);
    });
  });

  describe('fetchPrinters', () => {
    it('populates printers on success', async () => {
      await useClassManagementStore.getState().fetchPrinters();

      const state = useClassManagementStore.getState();
      expect(state.printers).toHaveLength(1);
      expect(state.arePrintersLoading).toBe(false);
    });
  });

  describe('searchGroupsOrUsers', () => {
    it('returns formatted search results on success', async () => {
      const translate = (key: string) => key;
      const result = await useClassManagementStore.getState().searchGroupsOrUsers('user1', translate);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(expect.objectContaining({ cn: 'user1', value: 'user1' }));
      expect(useClassManagementStore.getState().isSearchGroupsLoading).toBe(false);
    });

    it('returns empty array on error', async () => {
      server.use(
        http.get('/edu-api/lmn-api/search', () =>
          HttpResponse.json({ message: 'search.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const translate = (key: string) => key;
      const result = await useClassManagementStore.getState().searchGroupsOrUsers('invalid', translate);

      expect(result).toEqual([]);
      expect(useClassManagementStore.getState().isSearchGroupsLoading).toBe(false);
    });
  });

  describe('reset', () => {
    it('returns state to initial values', async () => {
      await useClassManagementStore.getState().fetchUserSchoolClasses();
      expect(useClassManagementStore.getState().userSchoolClasses.length).toBeGreaterThan(0);

      useClassManagementStore.getState().reset();

      const state = useClassManagementStore.getState();
      expect(state.userSchoolClasses).toEqual([]);
      expect(state.userProjects).toEqual([]);
      expect(state.userSessions).toEqual([]);
      expect(state.userRoom).toBeNull();
      expect(state.printers).toEqual([]);
      expect(state.isLoading).toBe(false);
    });
  });
});
