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

import axios from 'axios';
import { Interval, Timeout } from '@nestjs/schedule';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { LDAPUser } from '@libs/groups/types/ldapUser';
import { Group } from '@libs/groups/types/group';
import GroupsErrorMessage from '@libs/groups/types/groupsErrorMessage';
import { GROUPS_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import {
  ALL_GROUPS_CACHE_KEY,
  ALL_SCHOOLS_CACHE_KEY,
  GROUP_WITH_MEMBERS_CACHE_KEY,
} from '@libs/groups/constants/cacheKeys';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import PROJECTS_PREFIX from '@libs/lmnApi/constants/prefixes/projectsPrefix';
import SCHOOLS_PREFIX from '@libs/lmnApi/constants/prefixes/schoolsPrefix';
import DEFAULT_SCHOOL from '@libs/lmnApi/constants/defaultSchool';
import ALL_GROUPS_PREFIX from '@libs/lmnApi/constants/prefixes/allGroupsPrefix';
import LINBO_DEVICE_GROUPS_PREFIX from '@libs/lmnApi/constants/prefixes/dPrefix';
import ROLES_PREFIX from '@libs/lmnApi/constants/prefixes/rolesPrefix';
import { KEYCLOAK_STARTUP_TIMEOUT_MS, KEYCLOAK_SYNC_MS } from '@libs/ldapKeycloakSync/constants/keycloakSyncValues';
import { OnEvent } from '@nestjs/event-emitter';
import GROUPS_CACHE_REFRESH_EVENT from '@libs/groups/constants/groupsCacheRefreshEvent';
import CustomHttpException from '../common/CustomHttpException';
import Attendee from '../conferences/attendee.schema';
import KeycloakRequestQueue from '../ldap-keycloak-sync/queue/keycloak-request.queue';

const { KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env as { [key: string]: string };

@Injectable()
class GroupsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly keycloakQueue: KeycloakRequestQueue,
  ) {}

  private isUpdatingGroupsAndMembersInCache = false;

  private maximumRetries = 3;

  @Timeout(KEYCLOAK_STARTUP_TIMEOUT_MS)
  async initializeService() {
    await this.updateGroupsAndMembersInCache();
  }

  @OnEvent(GROUPS_CACHE_REFRESH_EVENT, { async: true })
  async handleGroupsCacheRefresh() {
    await this.updateGroupsAndMembersInCache();
  }

  async fetchAllUsers(): Promise<LDAPUser[]> {
    try {
      return await this.keycloakQueue.fetchAllPaginated<LDAPUser>('/users', '');
    } catch (error) {
      throw new CustomHttpException(
        GroupsErrorMessage.CouldNotGetUsers,
        HttpStatus.BAD_GATEWAY,
        undefined,
        GroupsService.name,
      );
    }
  }

  static async fetchCurrentUser(token: string): Promise<JwtUser> {
    try {
      const tokenEndpoint = `${KEYCLOAK_API}/realms/${KEYCLOAK_EDU_UI_REALM}${AUTH_PATHS.AUTH_OIDC_USERINFO_PATH}`;

      const response = await axios.get<JwtUser>(tokenEndpoint, {
        headers: {
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
          [HTTP_HEADERS.Authorization]: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      throw new CustomHttpException(
        GroupsErrorMessage.CouldNotGetCurrentUser,
        HttpStatus.BAD_GATEWAY,
        undefined,
        GroupsService.name,
      );
    }
  }

  private static sanitizeGroupMembers(members: (LDAPUser | GroupMemberDto)[]): GroupMemberDto[] {
    if (!Array.isArray(members)) return [];

    const sanitized: GroupMemberDto[] = members.map((m) => ({
      id: m.id ?? '',
      username: m.username ?? '',
      firstName: m.firstName ?? '',
      lastName: m.lastName ?? '',
      email: m.email ?? '',
    }));

    const valid = sanitized.filter((m) => m.id.trim().length > 0 && m.username.trim().length > 0);

    const dropped = sanitized.length - valid.length;
    if (dropped > 0) {
      Logger.warn(
        `Sanitizing group members dropped ${dropped} invalid entries (${valid.length} valid).`,
        GroupsService.name,
      );
    }

    return valid;
  }

  private async fetchAndCacheAllGroups(): Promise<Group[]> {
    const groups = await this.fetchAllGroups();

    await this.cacheManager.set(ALL_GROUPS_CACHE_KEY + SPECIAL_SCHOOLS.GLOBAL, groups, GROUPS_CACHE_TTL_MS);

    return groups;
  }

  private async cacheSchoolGroups(groups: Group[]): Promise<string[]> {
    const schoolGroups = groups
      .filter((group) => group.path.startsWith(SCHOOLS_PREFIX))
      .map((s) => ({ ...s, name: s.path.replace(SCHOOLS_PREFIX, '') }));
    await this.cacheManager.set(ALL_SCHOOLS_CACHE_KEY, schoolGroups, GROUPS_CACHE_TTL_MS);

    return schoolGroups.map((schoolGroup) => schoolGroup.name).filter(Boolean);
  }

  private async cacheGroupsBySchoolName(schoolGroupNames: string[], allGroups: Group[]): Promise<void> {
    const schoolNameToGroups = new Map<string, Group[]>();
    const alreadyAssignedGroupPaths = new Set<string>();

    const multiSchoolNames = schoolGroupNames.filter((name) => name !== DEFAULT_SCHOOL);

    multiSchoolNames.forEach((schoolName) => {
      const groupsBelongingToSchool = allGroups.filter(
        (g) => g.path.startsWith(`${PROJECTS_PREFIX}${schoolName}-`) || g.path.startsWith(`/${schoolName}-`),
      );

      schoolNameToGroups.set(schoolName, groupsBelongingToSchool);

      groupsBelongingToSchool.forEach((group) => {
        alreadyAssignedGroupPaths.add(group.path);
      });
    });

    if (schoolGroupNames.includes(DEFAULT_SCHOOL)) {
      const defaultSchoolGroups = allGroups.filter((g) => {
        const isUnassigned = !alreadyAssignedGroupPaths.has(g.path);
        const isExcluded = [ALL_GROUPS_PREFIX, SCHOOLS_PREFIX, ROLES_PREFIX, LINBO_DEVICE_GROUPS_PREFIX].some((p) =>
          g.path.startsWith(p),
        );
        return isUnassigned && !isExcluded;
      });

      schoolNameToGroups.set(DEFAULT_SCHOOL, defaultSchoolGroups);
    }

    const setGroupsPromises: Promise<Group[]>[] = [];
    schoolNameToGroups.forEach((groups, schoolName) => {
      setGroupsPromises.push(this.cacheManager.set(ALL_GROUPS_CACHE_KEY + schoolName, groups, GROUPS_CACHE_TTL_MS));
    });

    await Promise.all(setGroupsPromises);
  }

  private async updateGroupsWithMembersInCache(groups: Group[]): Promise<void> {
    const failedGroups = await this.tryUpdateGroupsWithMembersInCache(groups, 1);

    if (failedGroups.length > 0) {
      Logger.error(
        `Some groups (${failedGroups.map((g) => g.id).join(', ')}) failed to update after ${
          this.maximumRetries
        } attempts.`,
        GroupsService.name,
      );
    } else {
      Logger.log(`${groups.length} groups updated successfully in cache. ✅`, GroupsService.name);
    }
  }

  private async tryUpdateGroupsWithMembersInCache(groups: Group[], attempt: number): Promise<Group[]> {
    const results = await Promise.allSettled(groups.map((group) => this.updateGroupWithMembersInCache(group)));

    const failedGroups: Group[] = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedGroups.push(groups[index]);
      }
    });

    if (failedGroups.length > 0 && attempt < this.maximumRetries) {
      return this.tryUpdateGroupsWithMembersInCache(failedGroups, attempt + 1);
    }

    return failedGroups;
  }

  async updateGroupWithMembersInCache(
    group: Group | GroupWithMembers,
    updatedMembers?: GroupMemberDto[],
  ): Promise<void> {
    let newMembers = updatedMembers;
    if (!newMembers?.length) {
      newMembers = await this.fetchGroupMembers(group.id);
    }

    Logger.verbose(`Updating group ${group.name} (${group.id}) with ${newMembers?.length} members`, GroupsService.name);
    const sanitizedMembers = newMembers?.length ? GroupsService.sanitizeGroupMembers(newMembers) : [];

    await this.cacheManager.set(
      `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
      {
        ...group,
        members: sanitizedMembers,
      },
      GROUPS_CACHE_TTL_MS,
    );
  }

  @Interval(KEYCLOAK_SYNC_MS)
  async updateGroupsAndMembersInCache(): Promise<void> {
    if (this.isUpdatingGroupsAndMembersInCache) return;
    this.isUpdatingGroupsAndMembersInCache = true;

    try {
      Logger.debug(`Starting to update all groups in cache...`, GroupsService.name);
      const allGroups = await this.fetchAndCacheAllGroups();

      const schoolGroupNames = await this.cacheSchoolGroups(allGroups);

      await this.cacheGroupsBySchoolName(schoolGroupNames, allGroups);

      await this.updateGroupsWithMembersInCache(allGroups);
    } catch (error) {
      Logger.error(`updateGroupsAndMembersInCache failed.`, GroupsService.name);
    } finally {
      this.isUpdatingGroupsAndMembersInCache = false;
    }
  }

  async getInvitedMembers(
    invitedGroups: (MultipleSelectorGroup | Group | { path: string })[],
    invitedAttendees: (AttendeeDto | Attendee)[],
  ): Promise<string[]> {
    const usersInGroups = await Promise.all(
      invitedGroups.map(async (group) => {
        const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
          `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
        );

        return groupWithMembers?.members?.map((member) => member.username) || [];
      }),
    );

    return Array.from(new Set([...invitedAttendees.map((attendee) => attendee.username), ...usersInGroups.flat()]));
  }

  private static flattenGroups(groups: Group[]): Group[] {
    const flatGroups: Group[] = [];

    function traverseSubGroups(group: Group): Group {
      flatGroups.push(group);

      if (group.subGroups && group.subGroups.length > 0) {
        const updatedSubGroups = group.subGroups.map((subGroup) => traverseSubGroups(subGroup));
        return { ...group, subGroups: updatedSubGroups };
      }

      return group;
    }

    groups.forEach((group) => traverseSubGroups(group));

    return flatGroups;
  }

  async fetchAllGroups(): Promise<Group[]> {
    try {
      const groups = await this.keycloakQueue.fetchAllPaginated<Group>('/groups', 'briefRepresentation=false&search');
      return GroupsService.flattenGroups(groups);
    } catch (error) {
      throw new CustomHttpException(
        GroupsErrorMessage.CouldNotGetAllGroups,
        HttpStatus.BAD_GATEWAY,
        undefined,
        GroupsService.name,
      );
    }
  }

  async fetchGroupMembers(groupId: string): Promise<LDAPUser[] | undefined> {
    return this.keycloakQueue.fetchAllPaginated<LDAPUser>(`/groups/${groupId}/members`, 'briefRepresentation=true');
  }

  public async searchGroups(school: string, searchKeyWord?: string): Promise<Group[]> {
    try {
      const groups = await this.cacheManager.get<Group[]>(ALL_GROUPS_CACHE_KEY + school);
      if (!groups) {
        return [];
      }

      if (!searchKeyWord) {
        return groups;
      }

      return groups.filter((group) => group.path.includes(searchKeyWord));
    } catch (error) {
      throw new CustomHttpException(
        GroupsErrorMessage.CouldNotSearchGroups,
        HttpStatus.BAD_GATEWAY,
        searchKeyWord,
        GroupsService.name,
      );
    }
  }
}

export default GroupsService;
