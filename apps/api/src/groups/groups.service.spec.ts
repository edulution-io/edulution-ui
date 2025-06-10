/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SchedulerRegistry } from '@nestjs/schedule';
import axios from 'axios';
import { readFileSync } from 'fs';
import { JwtService } from '@nestjs/jwt';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import { Group } from '@libs/groups/types/group';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import CustomHttpException from '../common/CustomHttpException';
import GroupsService from './groups.service';

jest.useFakeTimers();

jest.mock('axios');
jest.mock('fs', () => ({
  readFileSync: jest.fn().mockReturnValue('mockPublicKey'),
}));

const cacheManagerMock = {
  get: jest.fn(),
  set: jest.fn(),
};

const schedulerRegistryMock = {
  addInterval: jest.fn().mockImplementation((_, interval: NodeJS.Timeout) => interval.unref()),
  deleteInterval: jest.fn(),
};

const jwtServiceMock = { verifyAsync: jest.fn() };

describe('GroupsService', () => {
  let service: GroupsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: SchedulerRegistry, useValue: schedulerRegistryMock },
        { provide: JwtService, useValue: jwtServiceMock },
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

  describe('scheduleTokenRefresh', () => {
    it('should set an interval for token refresh', () => {
      service.scheduleTokenRefresh();
      expect(schedulerRegistryMock.addInterval).toHaveBeenCalled();
    });
  });

  it('should obtain and decode an access token', async () => {
    const mockToken = 'mockToken';
    const decodedToken: JwtUser = { exp: 1000, iat: 0 } as JwtUser;
    (axios.post as jest.Mock).mockResolvedValue({ data: { access_token: mockToken } });
    jwtServiceMock.verifyAsync.mockResolvedValue(decodedToken);

    await service.obtainAccessToken();

    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );
    expect(readFileSync).toHaveBeenCalledWith(expect.any(String), 'utf8');
    expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith(mockToken, {
      publicKey: 'mockPublicKey',
      algorithms: ['RS256'],
    });
    expect(schedulerRegistryMock.deleteInterval).toHaveBeenCalledWith(expect.any(String));
    expect(schedulerRegistryMock.addInterval).toHaveBeenCalled();
  });

  describe('fetchAllGroups', () => {
    it('should return all groups on success', async () => {
      const mockGroups = [{ id: '1', name: 'Group 1' }];
      (axios.request as jest.Mock).mockResolvedValue({ data: mockGroups });

      const result = await service.fetchAllGroups();
      expect(result).toEqual(mockGroups);
    });

    it('should throw an error on failure', async () => {
      (axios.request as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(service.fetchAllGroups()).rejects.toThrow(CustomHttpException);
    });
  });

  describe('fetchAllUsers', () => {
    it('should fetch all users successfully', async () => {
      const mockUsers = [{ id: '1', username: 'user1' }];
      (axios.request as jest.Mock).mockResolvedValue({ data: mockUsers });

      const result = await service.fetchAllUsers();
      expect(result).toEqual(mockUsers);
    });

    it('should throw an error if unable to fetch users', async () => {
      (axios.request as jest.Mock).mockRejectedValue(new Error('API error'));

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
    it('should throw an error if unable to fetch group members', async () => {
      (axios.request as jest.Mock).mockRejectedValue(new Error('API error'));
      await expect(service.fetchGroupMembers('groupId')).rejects.toThrow(Error);
    });

    it('should fetch members of a group successfully', async () => {
      const mockMembers = [{ id: 'user1', username: 'member1' }];
      (axios.request as jest.Mock).mockResolvedValue({ data: mockMembers });

      const result = await service.fetchGroupMembers('groupId');
      expect(result).toEqual(mockMembers);
    });
  });

  describe('updateGroupsAndMembersInCache', () => {
    it('should update groups and members in cache', async () => {
      const mockGroups = [{ id: '1', path: 'group1' }];
      const mockMembers = [{ id: 'user1', username: 'member1' }];
      jest.spyOn(service, 'fetchAllGroups').mockResolvedValue(mockGroups as Group[]);
      jest.spyOn(service, 'fetchGroupMembers').mockResolvedValue(mockMembers as LDAPUser[]);

      await service.updateGroupsAndMembersInCache();

      expect(cacheManagerMock.set).toHaveBeenCalledWith(expect.any(String), expect.any(Object), expect.any(Number));
      expect(cacheManagerMock.set).toHaveBeenCalledTimes(3);
    });
  });

  describe('searchGroups', () => {
    it('should return all groups when no search keyword is provided', async () => {
      const mockGroups = [{ id: '1', path: 'group1' }];
      cacheManagerMock.get.mockResolvedValue(mockGroups);

      const result = await service.searchGroups(SPECIAL_SCHOOLS.GLOBAL);
      expect(result).toEqual(mockGroups);
    });

    it('should filter groups by search keyword', async () => {
      const mockGroups = [
        { id: '1', path: '/s_test' },
        { id: '2', path: '/s-testgroup' },
      ];
      cacheManagerMock.get.mockResolvedValue(mockGroups);

      const result = await service.searchGroups('test');
      expect(result).toEqual(mockGroups);
    });

    it('should return an empty array if no groups match the search', async () => {
      cacheManagerMock.get.mockResolvedValue([]);

      const result = await service.searchGroups('nonexistent');
      expect(result).toEqual([]);
    });
  });

  describe('updateTokenRefreshInterval', () => {
    it('should update the token refresh interval', () => {
      service.updateTokenRefreshInterval();
      expect(schedulerRegistryMock.deleteInterval).toHaveBeenCalledWith(expect.any(String));
      expect(schedulerRegistryMock.addInterval).toHaveBeenCalled();
    });
  });

  describe('fetchGroupMembers', () => {
    it('should fetch members of a group successfully', async () => {
      const mockMembers = [{ id: 'user1', username: 'member1' }];
      (axios.request as jest.Mock).mockResolvedValue({ data: mockMembers });

      const result = await service.fetchGroupMembers('groupId');
      expect(result).toEqual(mockMembers);
    });
  });

  describe('sanitizeGroup and sanitizeGroupMembers', () => {
    it('should sanitize a group object', () => {
      const group = { id: '1', name: 'Group 1', path: 'path1', subGroups: [] };
      const sanitized = GroupsService['sanitizeGroup'](group);
      expect(sanitized).toEqual({ id: '1', name: 'Group 1', path: 'path1' });
    });

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
          subGroups: [{ id: '2', name: 'Group 2', path: 'path2', subGroups: [] }],
        },
      ];
      const flatGroups = GroupsService['flattenGroups'](groups);
      expect(flatGroups).toHaveLength(2);
    });
  });

  describe('updateTokenRefreshInterval', () => {
    it('should update token refresh interval by deleting and adding interval', () => {
      service.updateTokenRefreshInterval();
      expect(schedulerRegistryMock.deleteInterval).toHaveBeenCalledWith(expect.any(String));
      expect(schedulerRegistryMock.addInterval).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
