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
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';
import { HttpMethods } from '@libs/common/types/http-methods';
import keycloakUserStorageProvider from '@libs/ldapKeycloakSync/constants/keycloakUserStorageProvider';
import DEPLOYMENT_TARGET from '@libs/common/constants/deployment-target';
import { DEPLOYMENT_TARGET_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import LdapKeycloakSyncService from './ldap-keycloak-sync.service';
import { LdapKeycloakSync } from './ldap-keycloak-sync.schema';
import GlobalSettingsService from '../global-settings/global-settings.service';
import KeycloakRequestQueue from '../groups/queue/keycloak-request.queue';
import GroupsService from '../groups/groups.service';

const mockLdapConfig = {
  id: 'ldap-comp-1',
  providerType: keycloakUserStorageProvider,
  config: {
    connectionUrl: ['ldap://ldap.example.com'],
    usersDn: ['DC=example,DC=com'],
    startTls: ['false'],
  },
};

const mockCacheStore = new Map<string, unknown>();

const mockCache = {
  get: jest.fn().mockImplementation((key: string) => Promise.resolve(mockCacheStore.get(key) ?? null)),
  set: jest.fn().mockImplementation((key: string, value: unknown) => {
    mockCacheStore.set(key, value);
    return Promise.resolve();
  }),
};

describe(LdapKeycloakSyncService.name, () => {
  let service: LdapKeycloakSyncService;
  let keycloakQueue: Record<string, jest.Mock>;
  let groupsService: Record<string, jest.Mock>;
  let globalSettingsService: Record<string, jest.Mock>;
  let eventEmitter: Record<string, jest.Mock>;
  let ldapKeycloakSyncModel: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockCacheStore.clear();

    keycloakQueue = {
      enqueue: jest.fn().mockResolvedValue([]),
    };

    groupsService = {
      createGroup: jest.fn().mockResolvedValue(undefined),
      searchGroupsByName: jest.fn().mockResolvedValue([]),
      searchUsersByUsername: jest.fn().mockResolvedValue([]),
      updateGroupAttributes: jest.fn().mockResolvedValue(undefined),
      updateGroupAttributesInCache: jest.fn().mockResolvedValue(undefined),
      updateAllGroupsAttributesInCache: jest.fn().mockResolvedValue(undefined),
      updateGroupWithMembersInCache: jest.fn().mockResolvedValue(undefined),
      addGroupToCache: jest.fn().mockResolvedValue(undefined),
      deleteGroup: jest.fn().mockResolvedValue(undefined),
      deleteGroupFromCache: jest.fn().mockResolvedValue(undefined),
      addUserToGroups: jest.fn().mockResolvedValue(undefined),
      removeUserFromGroups: jest.fn().mockResolvedValue(undefined),
      getInvitedMembers: jest.fn().mockResolvedValue([]),
    };

    globalSettingsService = {
      getAdminGroupsFromCache: jest.fn().mockResolvedValue([]),
      getGlobalSettings: jest.fn().mockResolvedValue({
        general: {
          ldap: {
            binduser: {
              dn: 'CN=admin,DC=example,DC=com',
              password: 'secret',
            },
          },
        },
      }),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    ldapKeycloakSyncModel = {
      updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LdapKeycloakSyncService,
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: GlobalSettingsService, useValue: globalSettingsService },
        { provide: getModelToken(LdapKeycloakSync.name), useValue: ldapKeycloakSyncModel },
        { provide: KeycloakRequestQueue, useValue: keycloakQueue },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: GroupsService, useValue: groupsService },
        { provide: SchedulerRegistry, useValue: { addInterval: jest.fn(), addTimeout: jest.fn() } },
      ],
    }).compile();

    service = module.get<LdapKeycloakSyncService>(LdapKeycloakSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should not throw', () => {
      expect(() => service.onModuleInit()).not.toThrow();
    });
  });

  describe('init', () => {
    it('should load LDAP config and emit event when config found', async () => {
      keycloakQueue.enqueue.mockResolvedValue([mockLdapConfig]);

      await service.init();

      expect(keycloakQueue.enqueue).toHaveBeenCalledWith(HttpMethods.GET, '/components');
      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should not emit event when no LDAP config found', async () => {
      keycloakQueue.enqueue.mockResolvedValue([]);

      await service.init();

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('handleGroupsCacheInitialized', () => {
    it('should set groupsCacheReady flag', () => {
      service.handleGroupsCacheInitialized();
      expect(service['groupsCacheReady']).toBe(true);
    });
  });

  describe('handleUsersCacheInitialized', () => {
    it('should set usersCacheReady flag', () => {
      service.handleUsersCacheInitialized();
      expect(service['usersCacheReady']).toBe(true);
    });
  });

  describe('sync', () => {
    it('should skip sync when no LDAP config', async () => {
      keycloakQueue.enqueue.mockResolvedValue([]);

      await service.sync();

      expect(eventEmitter.emit).toHaveBeenCalled();
    });

    it('should skip sync when caches are not ready', async () => {
      keycloakQueue.enqueue.mockResolvedValue([mockLdapConfig]);

      await service.sync();

      expect(globalSettingsService.getAdminGroupsFromCache).not.toHaveBeenCalled();
    });

    it('should skip sync when already running', async () => {
      keycloakQueue.enqueue.mockResolvedValue([mockLdapConfig]);
      service.handleGroupsCacheInitialized();
      service.handleUsersCacheInitialized();

      service['isSyncRunning'] = true;

      await service.sync();

      expect(globalSettingsService.getAdminGroupsFromCache).not.toHaveBeenCalled();
    });

    it('should skip sync when deployment target is missing', async () => {
      keycloakQueue.enqueue.mockResolvedValue([mockLdapConfig]);
      service.handleGroupsCacheInitialized();
      service.handleUsersCacheInitialized();
      mockCache.get.mockImplementation((key: string) => {
        if (key === DEPLOYMENT_TARGET_CACHE_KEY) return Promise.resolve(null);
        return Promise.resolve(null);
      });

      await service.sync();

      expect(globalSettingsService.getAdminGroupsFromCache).not.toHaveBeenCalled();
    });

    it('should handle sync failure gracefully', async () => {
      keycloakQueue.enqueue.mockResolvedValue([mockLdapConfig]);
      service.handleGroupsCacheInitialized();
      service.handleUsersCacheInitialized();
      mockCacheStore.set(DEPLOYMENT_TARGET_CACHE_KEY, DEPLOYMENT_TARGET.LINUXMUSTER);

      globalSettingsService.getGlobalSettings.mockRejectedValue(new Error('LDAP bind failed'));

      await service.sync();

      expect(service['isSyncRunning']).toBe(false);
      expect(eventEmitter.emit).toHaveBeenCalled();
    });
  });

  describe('updateGroupMembershipByNames', () => {
    it('should add users to a target group', async () => {
      const groupPath = '/teachers';
      const group = { id: 'g-1', name: 'teachers', path: groupPath, subGroups: [] };
      mockCacheStore.set('allGroups-global', [group]);
      mockCache.get.mockImplementation((key: string) => Promise.resolve(mockCacheStore.get(key) ?? null));

      groupsService.searchUsersByUsername.mockResolvedValue([
        { id: 'u-1', username: 'alice', firstName: 'Alice', lastName: 'Smith', email: 'alice@test.com' },
      ]);

      await service.updateGroupMembershipByNames('teachers', ['alice'], [], [], []);

      expect(groupsService.addUserToGroups).toHaveBeenCalledWith('u-1', ['g-1']);
    });

    it('should remove users from a target group', async () => {
      const group = { id: 'g-1', name: 'teachers', path: '/teachers', subGroups: [] };
      mockCacheStore.set('allGroups-global', [group]);
      mockCache.get.mockImplementation((key: string) => Promise.resolve(mockCacheStore.get(key) ?? null));

      groupsService.searchUsersByUsername.mockResolvedValue([
        { id: 'u-2', username: 'bob', firstName: 'Bob', lastName: 'Jones', email: 'bob@test.com' },
      ]);

      await service.updateGroupMembershipByNames('teachers', [], ['bob'], [], []);

      expect(groupsService.removeUserFromGroups).toHaveBeenCalledWith('u-2', ['g-1']);
    });

    it('should create group if not found in cache', async () => {
      mockCacheStore.set('allGroups-global', []);
      mockCache.get.mockImplementation((key: string) => Promise.resolve(mockCacheStore.get(key) ?? null));

      const newGroup = { id: 'g-new', name: 'newgroup', path: '/newgroup', subGroups: [] };
      groupsService.searchGroupsByName.mockResolvedValue([newGroup]);

      await service.updateGroupMembershipByNames('newgroup', [], [], [], []);

      expect(groupsService.createGroup).toHaveBeenCalledWith('newgroup');
    });
  });

  describe('reconcileNamedGroupMembers', () => {
    it('should add missing users and remove extra users', async () => {
      const group = { id: 'g-1', name: 'class1', path: '/class1', subGroups: [] };
      mockCacheStore.set('allGroups-global', [group]);
      mockCacheStore.set('groupWithMembers-/class1', {
        ...group,
        members: [{ id: 'u-old', username: 'olduser', firstName: 'Old', lastName: 'User', email: '' }],
      });
      mockCache.get.mockImplementation((key: string) => Promise.resolve(mockCacheStore.get(key) ?? null));

      groupsService.searchUsersByUsername.mockResolvedValue([
        { id: 'u-new', username: 'newuser', firstName: 'New', lastName: 'User', email: '' },
      ]);

      await service.reconcileNamedGroupMembers('class1', ['newuser'], []);

      expect(groupsService.addUserToGroups).toHaveBeenCalledWith('u-new', ['g-1']);
      expect(groupsService.removeUserFromGroups).toHaveBeenCalledWith('u-old', ['g-1']);
    });
  });

  describe('static convertToGroupMemberDto', () => {
    it('should convert LDAPUser to GroupMemberDto', () => {
      const ldapUser = {
        id: 'u-1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      };

      const result = LdapKeycloakSyncService['convertToGroupMemberDto'](ldapUser as never);

      expect(result).toEqual({
        id: 'u-1',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
      });
    });
  });

  describe('static extractGroupAttributes', () => {
    it('should extract required attributes from LDAP entry', () => {
      const entry = {
        dn: 'CN=teachers,OU=Groups,DC=example,DC=com',
        distinguishedName: 'CN=teachers,OU=Groups,DC=example,DC=com',
        sophomorixSchoolname: ['school1'],
        description: 'Teachers group',
      };

      const result = LdapKeycloakSyncService['extractGroupAttributes'](entry as never);

      expect(typeof result).toBe('object');
    });

    it('should return empty object when no attributes present', () => {
      const entry = {
        dn: 'CN=empty,DC=example,DC=com',
        distinguishedName: 'CN=empty,DC=example,DC=com',
      };

      const result = LdapKeycloakSyncService['extractGroupAttributes'](entry as never);

      expect(result).toEqual({});
    });
  });

  describe('persistLastSync', () => {
    it('should upsert last sync timestamp', async () => {
      await service['persistLastSync']();

      expect(ldapKeycloakSyncModel.updateOne).toHaveBeenCalledWith({}, expect.anything(), { upsert: true });
      const updateArg = ldapKeycloakSyncModel.updateOne.mock.calls[0] as unknown[];
      const updateData = updateArg[1] as Record<string, unknown>;
      expect(updateData.lastSync).toBeInstanceOf(Date);
    });
  });
});
