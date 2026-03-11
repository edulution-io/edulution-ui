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
/* eslint-disable */

vi.mock('idb-keyval', () => ({
  get: vi.fn().mockResolvedValue(undefined),
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() } }));
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key }, t: (key: string) => key }));
vi.mock('@libs/userManagement/utils/csvUtils', () => ({
  isCommentEntry: vi.fn((entry: Record<string, any>) => !!entry.isComment),
}));

import { http, HttpResponse } from 'msw';
import { toast } from 'sonner';
import server from '@libs/test-utils/msw/server';
import useUserManagementStore from './useUserManagementStore';
import useLmnApiStore from '@/store/useLmnApiStore';
import EMPTY_LIST_DATA from '@libs/userManagement/constants/emptyListData';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import type ListManagementEntry from '@libs/userManagement/types/listManagementEntry';

const mockUser: Partial<LmnUserInfo> = {
  cn: 'testuser',
  displayName: 'Test User',
  sophomorixRole: 'student',
};

const mockEntry: ListManagementEntry = { login: 'user1', firstName: 'User', lastName: 'One' };
const mockCommentEntry: ListManagementEntry = { isComment: 'true', login: '#comment' } as any;

const mockSophomorixCheckData = {
  addcount: 2,
  updatecount: 1,
  killcount: 0,
};

const mockQuotaResponse = {
  '/home': { used: 100, soft_limit: 500, hard_limit: 1000 },
};

const initialStoreState = useUserManagementStore.getState();

describe('useUserManagementStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useUserManagementStore.setState(initialStoreState, true);
    useLmnApiStore.setState({ lmnApiToken: 'test-lmn-token' });
  });

  describe('fetchUsersByRole', () => {
    it('sets usersByType on success', async () => {
      server.use(http.get('*/lmn-api/roles/:role', () => HttpResponse.json([mockUser])));

      await useUserManagementStore.getState().fetchUsersByRole('students', 'students');

      expect(useUserManagementStore.getState().usersByType['students']).toEqual([mockUser]);
      expect(useUserManagementStore.getState().isLoadingUsers).toBe(false);
      expect(useUserManagementStore.getState().error).toBeNull();
    });

    it('sets error on failure', async () => {
      server.use(
        http.get('*/lmn-api/roles/:role', () =>
          HttpResponse.json({ message: 'roles.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useUserManagementStore.getState().fetchUsersByRole('students', 'students');

      expect(useUserManagementStore.getState().error).toBeTruthy();
      expect(useUserManagementStore.getState().isLoadingUsers).toBe(false);
    });

    it('does background fetch when cached data exists', async () => {
      useUserManagementStore.setState({ usersByType: { students: [mockUser as LmnUserInfo] } });

      server.use(http.get('*/lmn-api/roles/:role', () => HttpResponse.json([mockUser, mockUser])));

      await useUserManagementStore.getState().fetchUsersByRole('students', 'students');

      expect(useUserManagementStore.getState().usersByType['students']).toHaveLength(2);
      expect(useUserManagementStore.getState().isBackgroundFetchingUsers).toBe(false);
    });

    it('skips fetch when already loading', async () => {
      useUserManagementStore.setState({ isLoadingUsers: true });

      await useUserManagementStore.getState().fetchUsersByRole('teachers', 'teachers');

      expect(useUserManagementStore.getState().usersByType['teachers']).toBeUndefined();
    });
  });

  describe('fetchManagementList', () => {
    it('sets listDataByType on success', async () => {
      server.use(http.get('*/lmn-api/listmanagement/:school/:managementList', () => HttpResponse.json([mockEntry])));

      await useUserManagementStore.getState().fetchManagementList('default-school', 'students');

      const listData = useUserManagementStore.getState().listDataByType['students'];
      expect(listData?.managementListEntries).toEqual([mockEntry]);
      expect(listData?.savedListEntries).toEqual([mockEntry]);
      expect(listData?.deletedEntryIndices).toEqual([]);
      expect(useUserManagementStore.getState().isLoadingList).toBe(false);
    });

    it('separates comment entries from regular entries', async () => {
      server.use(
        http.get('*/lmn-api/listmanagement/:school/:managementList', () =>
          HttpResponse.json([mockEntry, mockCommentEntry]),
        ),
      );

      await useUserManagementStore.getState().fetchManagementList('default-school', 'students');

      const listData = useUserManagementStore.getState().listDataByType['students'];
      expect(listData?.managementListEntries).toEqual([mockEntry]);
      expect(listData?.commentEntries).toEqual([mockCommentEntry]);
    });

    it('sets error on failure', async () => {
      server.use(
        http.get('*/lmn-api/listmanagement/:school/:managementList', () =>
          HttpResponse.json({ message: 'list.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useUserManagementStore.getState().fetchManagementList('default-school', 'students');

      expect(useUserManagementStore.getState().error).toBeTruthy();
      expect(useUserManagementStore.getState().isLoadingList).toBe(false);
    });

    it('skips fetch when already loading', async () => {
      useUserManagementStore.setState({ isLoadingList: true });

      await useUserManagementStore.getState().fetchManagementList('default-school', 'students');

      expect(useUserManagementStore.getState().listDataByType['students']).toBeUndefined();
    });
  });

  describe('saveManagementList', () => {
    it('updates listDataByType and shows toast on success', async () => {
      const commentEntry: ListManagementEntry = { isComment: 'true' } as any;
      useUserManagementStore.setState({
        listDataByType: {
          students: {
            managementListEntries: [mockEntry],
            savedListEntries: [mockEntry],
            deletedEntryIndices: [0],
            commentEntries: [commentEntry],
          },
        },
      });

      server.use(http.post('*/lmn-api/listmanagement/:school/:managementList', () => HttpResponse.json({})));

      const newEntry: ListManagementEntry = { login: 'user2', firstName: 'User', lastName: 'Two' };
      await useUserManagementStore.getState().saveManagementList('default-school', 'students', [newEntry]);

      const listData = useUserManagementStore.getState().listDataByType['students'];
      expect(listData?.managementListEntries).toEqual([newEntry]);
      expect(listData?.savedListEntries).toEqual([newEntry]);
      expect(listData?.deletedEntryIndices).toEqual([]);
      expect(toast.success).toHaveBeenCalledWith('usermanagement.listSaved');
      expect(useUserManagementStore.getState().isSaving).toBe(false);
    });

    it('does not show toast in silent mode', async () => {
      server.use(http.post('*/lmn-api/listmanagement/:school/:managementList', () => HttpResponse.json({})));

      await useUserManagementStore.getState().saveManagementList('default-school', 'students', [mockEntry], true);

      expect(toast.success).not.toHaveBeenCalled();
    });

    it('sets error on failure', async () => {
      server.use(
        http.post('*/lmn-api/listmanagement/:school/:managementList', () =>
          HttpResponse.json({ message: 'save.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useUserManagementStore.getState().saveManagementList('default-school', 'students', [mockEntry]);

      expect(useUserManagementStore.getState().error).toBeTruthy();
      expect(useUserManagementStore.getState().isSaving).toBe(false);
    });

    it('skips save when already saving', async () => {
      useUserManagementStore.setState({ isSaving: true });

      await useUserManagementStore.getState().saveManagementList('default-school', 'students', [mockEntry]);

      expect(toast.success).not.toHaveBeenCalled();
    });
  });

  describe('runSophomorixCheck', () => {
    it('returns check data on success', async () => {
      server.use(
        http.get('*/lmn-api/listmanagement/sophomorix-check', () => HttpResponse.json(mockSophomorixCheckData)),
      );

      const result = await useUserManagementStore.getState().runSophomorixCheck();

      expect(result).toEqual(mockSophomorixCheckData);
      expect(useUserManagementStore.getState().isCheckLoading).toBe(false);
    });

    it('returns null on failure', async () => {
      server.use(
        http.get('*/lmn-api/listmanagement/sophomorix-check', () =>
          HttpResponse.json({ message: 'check.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useUserManagementStore.getState().runSophomorixCheck();

      expect(result).toBeNull();
      expect(useUserManagementStore.getState().isCheckLoading).toBe(false);
    });
  });

  describe('runSophomorixApply', () => {
    it('returns apply data and shows toast on success', async () => {
      server.use(
        http.post('*/lmn-api/listmanagement/sophomorix-apply', () => HttpResponse.json(mockSophomorixCheckData)),
      );

      const result = await useUserManagementStore.getState().runSophomorixApply('default-school', true, false, false);

      expect(result).toEqual(mockSophomorixCheckData);
      expect(toast.success).toHaveBeenCalledWith('usermanagement.applyCompleted');
      expect(useUserManagementStore.getState().isApplying).toBe(false);
    });

    it('returns null on failure', async () => {
      server.use(
        http.post('*/lmn-api/listmanagement/sophomorix-apply', () =>
          HttpResponse.json({ message: 'apply.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      const result = await useUserManagementStore.getState().runSophomorixApply('default-school', true, false, false);

      expect(result).toBeNull();
      expect(useUserManagementStore.getState().isApplying).toBe(false);
    });
  });

  describe('fetchSelectedUserDetails', () => {
    it('sets selectedUserDetails and selectedUserQuota on success', async () => {
      useUserManagementStore.setState({ selectedUserDetails: mockUser as LmnUserInfo });

      server.use(
        http.get('*/lmn-api/user/:username', ({ params }) => {
          if ((params.username as string).includes('quotas')) return HttpResponse.json(mockQuotaResponse);
          return HttpResponse.json(mockUser);
        }),
        http.get('*/lmn-api/user/:username/quotas', () => HttpResponse.json(mockQuotaResponse)),
      );

      await useUserManagementStore.getState().fetchSelectedUserDetails('testuser');

      expect(useUserManagementStore.getState().selectedUserDetails).toEqual(mockUser);
      expect(useUserManagementStore.getState().selectedUserQuota).toEqual(mockQuotaResponse);
      expect(useUserManagementStore.getState().isLoadingUserDetails).toBe(false);
    });

    it('does not update details when selectedUserDetails is null', async () => {
      server.use(
        http.get('*/lmn-api/user/:username', () => HttpResponse.json(mockUser)),
        http.get('*/lmn-api/user/:username/quotas', () => HttpResponse.json(mockQuotaResponse)),
      );

      await useUserManagementStore.getState().fetchSelectedUserDetails('testuser');

      expect(useUserManagementStore.getState().selectedUserDetails).toBeNull();
      expect(useUserManagementStore.getState().isLoadingUserDetails).toBe(false);
    });

    it('retains existing user when user fetch fails but selectedUserDetails is set', async () => {
      useUserManagementStore.setState({ selectedUserDetails: mockUser as LmnUserInfo });

      server.use(
        http.get('*/lmn-api/user/:username', () =>
          HttpResponse.json({ message: 'user.error', statusCode: 500 }, { status: 500 }),
        ),
        http.get('*/lmn-api/user/:username/quotas', () =>
          HttpResponse.json({ message: 'quota.error', statusCode: 500 }, { status: 500 }),
        ),
      );

      await useUserManagementStore.getState().fetchSelectedUserDetails('testuser');

      expect(useUserManagementStore.getState().selectedUserDetails).toEqual(mockUser);
      expect(useUserManagementStore.getState().selectedUserQuota).toBeNull();
    });
  });

  describe('setSelectedUserDetails', () => {
    it('sets selectedUserDetails and clears selectedUserQuota', () => {
      useUserManagementStore.setState({
        selectedUserDetails: mockUser as LmnUserInfo,
        selectedUserQuota: mockQuotaResponse as any,
      });

      const newUser = { cn: 'otheruser' } as LmnUserInfo;
      useUserManagementStore.getState().setSelectedUserDetails(newUser);

      expect(useUserManagementStore.getState().selectedUserDetails).toEqual(newUser);
      expect(useUserManagementStore.getState().selectedUserQuota).toBeNull();
    });

    it('sets selectedUserDetails to null and clears selectedUserQuota', () => {
      useUserManagementStore.setState({
        selectedUserDetails: mockUser as LmnUserInfo,
        selectedUserQuota: mockQuotaResponse as any,
      });

      useUserManagementStore.getState().setSelectedUserDetails(null);

      expect(useUserManagementStore.getState().selectedUserDetails).toBeNull();
      expect(useUserManagementStore.getState().selectedUserQuota).toBeNull();
    });
  });

  describe('getListData', () => {
    it('returns listDataByType entry when it exists', () => {
      const listData = {
        managementListEntries: [mockEntry],
        savedListEntries: [mockEntry],
        deletedEntryIndices: [],
        commentEntries: [],
      };
      useUserManagementStore.setState({ listDataByType: { students: listData } });

      const result = useUserManagementStore.getState().getListData('students');

      expect(result).toEqual(listData);
    });

    it('returns EMPTY_LIST_DATA when entry does not exist', () => {
      const result = useUserManagementStore.getState().getListData('nonexistent');

      expect(result).toEqual(EMPTY_LIST_DATA);
    });
  });

  describe('setManagementListEntries', () => {
    it('updates managementListEntries for the given managementList', () => {
      const initial = {
        managementListEntries: [],
        savedListEntries: [],
        deletedEntryIndices: [],
        commentEntries: [],
      };
      useUserManagementStore.setState({ listDataByType: { students: initial } });

      const newEntries = [mockEntry];
      useUserManagementStore.getState().setManagementListEntries('students', newEntries);

      expect(useUserManagementStore.getState().listDataByType['students']?.managementListEntries).toEqual(newEntries);
      expect(useUserManagementStore.getState().listDataByType['students']?.savedListEntries).toEqual([]);
    });

    it('creates new list entry from EMPTY_LIST_DATA when none exists', () => {
      useUserManagementStore.getState().setManagementListEntries('newlist', [mockEntry]);

      expect(useUserManagementStore.getState().listDataByType['newlist']?.managementListEntries).toEqual([mockEntry]);
    });
  });

  describe('setCommentEntries', () => {
    it('updates commentEntries for the given managementList', () => {
      const initial = {
        managementListEntries: [mockEntry],
        savedListEntries: [mockEntry],
        deletedEntryIndices: [],
        commentEntries: [],
      };
      useUserManagementStore.setState({ listDataByType: { students: initial } });

      const newComments = [mockCommentEntry];
      useUserManagementStore.getState().setCommentEntries('students', newComments);

      expect(useUserManagementStore.getState().listDataByType['students']?.commentEntries).toEqual(newComments);
      expect(useUserManagementStore.getState().listDataByType['students']?.managementListEntries).toEqual([mockEntry]);
    });

    it('creates new list entry from EMPTY_LIST_DATA when none exists', () => {
      useUserManagementStore.getState().setCommentEntries('newlist', [mockCommentEntry]);

      expect(useUserManagementStore.getState().listDataByType['newlist']?.commentEntries).toEqual([mockCommentEntry]);
    });
  });

  describe('addDeletedEntryIndex', () => {
    it('appends index to deletedEntryIndices', () => {
      const initial = {
        managementListEntries: [mockEntry],
        savedListEntries: [mockEntry],
        deletedEntryIndices: [1],
        commentEntries: [],
      };
      useUserManagementStore.setState({ listDataByType: { students: initial } });

      useUserManagementStore.getState().addDeletedEntryIndex('students', 3);

      expect(useUserManagementStore.getState().listDataByType['students']?.deletedEntryIndices).toEqual([1, 3]);
    });

    it('creates new list entry from EMPTY_LIST_DATA when none exists', () => {
      useUserManagementStore.getState().addDeletedEntryIndex('newlist', 0);

      expect(useUserManagementStore.getState().listDataByType['newlist']?.deletedEntryIndices).toEqual([0]);
    });
  });

  describe('reset', () => {
    it('resets state to initial values', () => {
      useUserManagementStore.setState({
        usersByType: { students: [mockUser as LmnUserInfo] },
        listDataByType: {
          students: {
            managementListEntries: [mockEntry],
            savedListEntries: [],
            deletedEntryIndices: [],
            commentEntries: [],
          },
        },
        isLoadingUsers: true,
        isLoadingList: true,
        isSaving: true,
        isCheckLoading: true,
        isApplying: true,
        selectedUserDetails: mockUser as LmnUserInfo,
        selectedUserQuota: mockQuotaResponse as any,
        error: 'some-error',
      });

      useUserManagementStore.getState().reset();

      const state = useUserManagementStore.getState();
      expect(state.usersByType).toEqual({});
      expect(state.listDataByType).toEqual({});
      expect(state.isLoadingUsers).toBe(false);
      expect(state.isLoadingList).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.isCheckLoading).toBe(false);
      expect(state.isApplying).toBe(false);
      expect(state.selectedUserDetails).toBeNull();
      expect(state.selectedUserQuota).toBeNull();
      expect(state.error).toBeNull();
    });
  });
});
