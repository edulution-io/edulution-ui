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

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import axios from 'axios';
import { Group } from '@libs/groups/types/group';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import {
  ALL_GROUPS_CACHE_KEY,
  ALL_SCHOOLS_CACHE_KEY,
  GROUP_WITH_MEMBERS_CACHE_KEY,
} from '@libs/groups/constants/cacheKeys';
import CustomHttpException from '../common/CustomHttpException';
import mockCacheManager from '../common/cache-manager.mock';
import KeycloakRequestQueue from './queue/keycloak-request.queue';
import GroupsService from './groups.service';

jest.useFakeTimers();

jest.mock('axios');

const keycloakQueueMock = {
  fetchAllPaginated: jest.fn(),
  enqueue: jest.fn(),
};

describe('GroupsService', () => {
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: KeycloakRequestQueue, useValue: keycloakQueueMock },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fetchAllGroups', () => {
    it('should return all groups on success', async () => {
      const mockGroups = [{ id: '1', name: 'Group 1', path: '/g1' }];
      keycloakQueueMock.fetchAllPaginated.mockResolvedValue(mockGroups);

      const result = await service.fetchAllGroups();
      expect(result).toEqual(mockGroups);
      expect(keycloakQueueMock.fetchAllPaginated).toHaveBeenCalledWith('/groups', 'briefRepresentation=false&search');
    });

    it('should throw an error on failure', async () => {
      keycloakQueueMock.fetchAllPaginated.mockRejectedValue(new Error('API error'));

      await expect(service.fetchAllGroups()).rejects.toThrow(CustomHttpException);
    });
  });

  describe('fetchAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [{ id: '1', username: 'user1' }];
      keycloakQueueMock.fetchAllPaginated.mockResolvedValue(mockUsers);

      const result = await service.fetchAllUsers();
      expect(result).toEqual(mockUsers);
      expect(keycloakQueueMock.fetchAllPaginated).toHaveBeenCalledWith('/users', '');
    });

    it('should throw an error if unable to fetch users', async () => {
      keycloakQueueMock.fetchAllPaginated.mockRejectedValue(new Error('API error'));

      await expect(service.fetchAllUsers()).rejects.toThrow(CustomHttpException);
    });
  });

  describe('fetchCurrentUser', () => {
    it('should fetch current user details', async () => {
      const mockUser = { id: 'user1' };
      (axios.get as jest.Mock).mockResolvedValue({ data: mockUser });

      const result = await GroupsService.fetchCurrentUser('mockToken');
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if unable to fetch current user', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(GroupsService.fetchCurrentUser('mockToken')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('fetchGroupMembers', () => {
    it('should fetch members of a group successfully', async () => {
      const mockMembers = [{ id: 'user1', username: 'member1' }];
      keycloakQueueMock.fetchAllPaginated.mockResolvedValue(mockMembers);

      const result = await service.fetchGroupMembers('groupId');
      expect(result).toEqual(mockMembers);
      expect(keycloakQueueMock.fetchAllPaginated).toHaveBeenCalledWith(
        '/groups/groupId/members',
        'briefRepresentation=true',
      );
    });
  });

  describe('updateGroupsAndMembersInCache', () => {
    it('should update groups and members in cache', async () => {
      const mockGroups = [{ id: '1', path: '/group1' }];
      const mockMembers = [{ id: 'user1', username: 'member1' }];
      jest.spyOn(service, 'fetchAllGroups').mockResolvedValue(mockGroups as Group[]);
      jest.spyOn(service, 'fetchGroupMembers').mockResolvedValue(mockMembers as LDAPUser[]);

      await service.updateGroupsAndMembersInCache();

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL,
        expect.any(Array),
        expect.any(Number),
      );
      expect(mockCacheManager.set).toHaveBeenCalledWith(ALL_SCHOOLS_CACHE_KEY, expect.any(Array), expect.any(Number));
      const hasMemberSetCall = mockCacheManager.set.mock.calls.some(
        ([key]) => typeof key === 'string' && key.startsWith(GROUP_WITH_MEMBERS_CACHE_KEY),
      );
      expect(hasMemberSetCall).toBe(true);
    });
  });

  describe('searchGroups', () => {
    it('should return all groups when no search keyword is provided', async () => {
      const mockGroups = [{ id: '1', path: 'group1' }];
      mockCacheManager.get.mockResolvedValue(mockGroups);

      const result = await service.searchGroups(SPECIAL_SCHOOLS.GLOBAL);
      expect(result).toEqual(mockGroups);
    });

    it('should filter groups by search keyword', async () => {
      const mockGroups = [
        { id: '1', path: '/s_test' },
        { id: '2', path: '/s-testgroup' },
      ];
      mockCacheManager.get.mockResolvedValue(mockGroups);

      const result = await service.searchGroups('test');
      expect(result).toEqual(mockGroups);
    });

    it('should return an empty array if no groups match the search', async () => {
      mockCacheManager.get.mockResolvedValue([]);

      const result = await service.searchGroups('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('sanitizeGroup and sanitizeGroupMembers', () => {
    it('should sanitize group members', () => {
      const members: LDAPUser[] = [
        { id: '1', username: 'user1', firstName: 'First', lastName: 'Last', email: 'email' } as LDAPUser,
      ];
      const sanitizedMembers = GroupsService['sanitizeGroupMembers'](members);
      expect(sanitizedMembers).toEqual([
        { id: '1', username: 'user1', firstName: 'First', lastName: 'Last', email: 'email' },
      ]);
    });
  });

  describe('flattenGroups', () => {
    it('should flatten nested groups into a single array', () => {
      const groups: Group[] = [
        {
          id: '1',
          name: 'Group 1',
          path: 'path1',
          subGroups: [
            {
              id: '2',
              name: 'Group 2',
              path: 'path2',
              subGroups: [],
              subGroupCount: 0,
              attributes: {
                description: [],
                cn: [],
                sophomorixMaillist: [],
                displayName: [],
                mail: [],
              },
              realmRoles: [],
              clientRoles: {},
              access: {
                view: true,
                viewMembers: true,
                manageMembers: true,
                manage: true,
                manageMembership: true,
              },
            } as Group,
          ],
        } as Group,
      ];
      const flatGroups = GroupsService['flattenGroups'](groups);
      expect(flatGroups).toHaveLength(2);
    });
  });
});
