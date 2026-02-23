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

import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { randomUUID } from 'crypto';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import PARENT_CHILD_PAIRING_STATUS from '@libs/parent-child-pairing/constants/parentChildPairingStatus';
import PARENT_CHILD_PAIRING_ERROR_MESSAGES from '@libs/parent-child-pairing/constants/parentChildPairingErrorMessages';
import PARENT_CHILD_PAIRING_LOG_ACTION from '@libs/parent-child-pairing/constants/parentChildPairingLogAction';
import type ParentChildPairingDto from '@libs/parent-child-pairing/types/parentChildPairingDto';
import PARENT_CHILD_PAIRING_CACHE_CONFIG from '@libs/parent-child-pairing/constants/parentChildPairingCacheConfig';
import type ParentChildPairingCodeResponseDto from '@libs/parent-child-pairing/types/parentChildPairingCodeResponseDto';
import type ParentChildPairingStatusType from '@libs/parent-child-pairing/types/parentChildPairingStatusType';
import type ParentChildPairingLogActionType from '@libs/parent-child-pairing/types/parentChildPairingLogActionType';
import type ParentChildPairingRelationshipDto from '@libs/parent-child-pairing/types/parentChildPairingRelationshipDto';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import PARENT_CHILD_PAIRING_GROUP_SUFFIX from '@libs/parent-child-pairing/constants/parentChildPairingGroupSuffix';
import type CachedUser from '@libs/user/types/cachedUser';
import getIsParent from '@libs/user/utils/getIsParent';
import CustomHttpException from '../common/CustomHttpException';
import LmnApiService from '../lmnApi/lmnApi.service';
import UsersService from '../users/users.service';
import { ParentChildPairing, ParentChildPairingDocument } from './parent-child-pairing.schema';

interface CachedPairingUserData {
  username: string;
  groups: string[];
  school: string;
  expiresAt: string;
}

@Injectable()
class ParentChildPairingService {
  constructor(
    @InjectModel(ParentChildPairing.name)
    private readonly parentChildPairingModel: Model<ParentChildPairingDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly lmnApiService: LmnApiService,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateCode(
    username: string,
    groups: string[],
    school: string,
  ): Promise<ParentChildPairingCodeResponseDto> {
    const codeKey = `${PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_KEY_PREFIX}${username}`;
    const existingCode = await this.cacheManager.get<string>(codeKey);

    if (existingCode) {
      const userKey = `${PARENT_CHILD_PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${existingCode}`;
      const userData = await this.cacheManager.get<CachedPairingUserData>(userKey);

      return {
        code: existingCode,
        expiresAt: userData?.expiresAt ?? new Date().toISOString(),
      };
    }

    return this.generateAndStoreCode(username, groups, school);
  }

  async refreshCode(username: string, groups: string[], school: string): Promise<ParentChildPairingCodeResponseDto> {
    await this.deleteExistingCode(username);
    return this.generateAndStoreCode(username, groups, school);
  }

  async createParentChildPairing(
    username: string,
    groups: string[],
    callerSchool: string,
    code: string,
  ): Promise<ParentChildPairingDto> {
    const target = await this.resolveCode(code);

    if (username === target.username) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.CANNOT_PAIR_WITH_SELF,
        HttpStatus.BAD_REQUEST,
        undefined,
        ParentChildPairingService.name,
      );
    }

    const callerIsParent = getIsParent(groups);
    const callerIsStudent = groups.includes(GroupRoles.STUDENT);

    if (!callerIsParent && !callerIsStudent) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.INVALID_ROLE,
        HttpStatus.FORBIDDEN,
        undefined,
        ParentChildPairingService.name,
      );
    }

    const targetIsParent = getIsParent(target.groups);
    const targetIsStudent = target.groups.includes(GroupRoles.STUDENT);

    if (!targetIsParent && !targetIsStudent) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.INVALID_ROLE,
        HttpStatus.FORBIDDEN,
        undefined,
        ParentChildPairingService.name,
      );
    }

    const hasParent = callerIsParent || targetIsParent;
    const hasStudent = callerIsStudent || targetIsStudent;

    if (!hasParent || !hasStudent) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.INCOMPATIBLE_ROLES,
        HttpStatus.BAD_REQUEST,
        undefined,
        ParentChildPairingService.name,
      );
    }

    const parent = callerIsParent ? username : target.username;
    const student = callerIsStudent ? username : target.username;
    const school = callerIsStudent ? callerSchool : target.school;

    const existingPairing = await this.parentChildPairingModel.findOne({ parent, student }).exec();
    if (existingPairing) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.PAIRING_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
        undefined,
        ParentChildPairingService.name,
      );
    }

    const parentChildPairing = await this.parentChildPairingModel.create({
      parent,
      student,
      school,
      status: PARENT_CHILD_PAIRING_STATUS.PENDING,
      logs: [
        {
          action: PARENT_CHILD_PAIRING_LOG_ACTION.PAIRING_REQUESTED,
          performedBy: username,
          timestamp: new Date(),
        },
      ],
    });

    Logger.log(
      `Parent-child pairing created: ${parent} <-> ${student} (school: ${school})`,
      ParentChildPairingService.name,
    );

    return ParentChildPairingService.toParentChildPairingDto(parentChildPairing);
  }

  async getRelationships(username: string, groups: string[]): Promise<ParentChildPairingDto[]> {
    const isParent = getIsParent(groups);
    const isStudent = groups.includes(GroupRoles.STUDENT);

    const filter: Record<string, string> = {};
    if (isParent) {
      filter.parent = username;
    } else if (isStudent) {
      filter.student = username;
    }

    const pairings = await this.parentChildPairingModel.find(filter).exec();

    return pairings.map((p) => ParentChildPairingService.toParentChildPairingDto(p));
  }

  async getEnrichedRelationships(
    username: string,
    groups: string[],
    school: string,
  ): Promise<ParentChildPairingRelationshipDto[]> {
    const cachedUsers = await this.usersService.findAllCachedUsers(school);
    const isParent = getIsParent(groups);
    const isStudent = groups.includes(GroupRoles.STUDENT);

    let activeRelationships: ParentChildPairingRelationshipDto[] = [];
    if (isStudent) {
      activeRelationships = await this.getActiveRelationshipsForStudent(username, school, cachedUsers);
    } else if (isParent) {
      activeRelationships = await this.getActiveRelationshipsForParent(username, groups, school, cachedUsers);
    }

    const nonActivePairings = await this.getNonActivePairingsFromDb(username, groups, cachedUsers, activeRelationships);

    return [...activeRelationships, ...nonActivePairings];
  }

  private async getActiveRelationshipsForStudent(
    studentUsername: string,
    school: string,
    cachedUsers: CachedUser[],
  ): Promise<ParentChildPairingRelationshipDto[]> {
    const groupKey = `${GROUP_WITH_MEMBERS_CACHE_KEY}-/${studentUsername}${PARENT_CHILD_PAIRING_GROUP_SUFFIX}`;
    const group = await this.cacheManager.get<GroupWithMembers>(groupKey);

    if (!group?.members) return [];

    const studentUser = cachedUsers.find((u) => u.username === studentUsername);

    return group.members.map((parentMember) => ({
      id: `ldap-${parentMember.username}-${studentUsername}`,
      parent: parentMember.username,
      student: studentUsername,
      school,
      status: PARENT_CHILD_PAIRING_STATUS.ACCEPTED,
      logs: [],
      createdAt: '',
      updatedAt: '',
      studentFirstName: studentUser?.firstName ?? '',
      studentLastName: studentUser?.lastName ?? '',
      parentFirstName: parentMember.firstName ?? '',
      parentLastName: parentMember.lastName ?? '',
      isGroupActive: true,
    }));
  }

  private async getActiveRelationshipsForParent(
    parentUsername: string,
    groups: string[],
    school: string,
    cachedUsers: CachedUser[],
  ): Promise<ParentChildPairingRelationshipDto[]> {
    const studentUsernames = ParentChildPairingService.extractStudentUsernamesFromGroups(groups);

    if (studentUsernames.length === 0) return [];

    const results = await Promise.all(
      studentUsernames.map(async (studentUsername) => {
        const groupKey = `${GROUP_WITH_MEMBERS_CACHE_KEY}-/${studentUsername}${PARENT_CHILD_PAIRING_GROUP_SUFFIX}`;
        const group = await this.cacheManager.get<GroupWithMembers>(groupKey);

        if (!group) return null;

        const parentMember = group.members?.find((m) => m.username === parentUsername);
        if (!parentMember) return null;

        const studentUser = cachedUsers.find((u) => u.username === studentUsername);
        if (!studentUser) return null;

        const result: ParentChildPairingRelationshipDto = {
          id: `ldap-${parentUsername}-${studentUsername}`,
          parent: parentUsername,
          student: studentUsername,
          school,
          status: PARENT_CHILD_PAIRING_STATUS.ACCEPTED,
          logs: [],
          createdAt: '',
          updatedAt: '',
          studentFirstName: studentUser.firstName ?? '',
          studentLastName: studentUser.lastName ?? '',
          parentFirstName: parentMember.firstName ?? '',
          parentLastName: parentMember.lastName ?? '',
          isGroupActive: true,
        };

        return result;
      }),
    );

    return results.filter((r): r is ParentChildPairingRelationshipDto => r !== null);
  }

  private async getNonActivePairingsFromDb(
    username: string,
    groups: string[],
    cachedUsers: CachedUser[],
    activeRelationships: ParentChildPairingRelationshipDto[],
  ): Promise<ParentChildPairingRelationshipDto[]> {
    const isParent = getIsParent(groups);
    const isStudent = groups.includes(GroupRoles.STUDENT);

    const filter: Record<string, unknown> = {
      status: { $in: [PARENT_CHILD_PAIRING_STATUS.PENDING, PARENT_CHILD_PAIRING_STATUS.REJECTED] },
    };
    if (isParent) filter.parent = username;
    else if (isStudent) filter.student = username;
    else return [];

    const pairings = await this.parentChildPairingModel.find(filter).exec();
    const activeKeys = new Set(activeRelationships.map((r) => `${r.parent}-${r.student}`));

    return pairings
      .map((p) => ParentChildPairingService.toParentChildPairingDto(p))
      .filter((p) => !activeKeys.has(`${p.parent}-${p.student}`))
      .map((pairing) => {
        const studentUser = cachedUsers.find((u) => u.username === pairing.student);
        const parentUser = cachedUsers.find((u) => u.username === pairing.parent);

        return {
          ...pairing,
          studentFirstName: studentUser?.firstName ?? '',
          studentLastName: studentUser?.lastName ?? '',
          parentFirstName: parentUser?.firstName ?? '',
          parentLastName: parentUser?.lastName ?? '',
          isGroupActive: false,
        };
      });
  }

  private static extractStudentUsernamesFromGroups(groups: string[]): string[] {
    return groups
      .filter((g) => g.endsWith(PARENT_CHILD_PAIRING_GROUP_SUFFIX))
      .map((g) => {
        const name = g.startsWith('/') ? g.slice(1) : g;
        return name.slice(0, -PARENT_CHILD_PAIRING_GROUP_SUFFIX.length);
      });
  }

  async getAllParentChildPairings(
    status?: ParentChildPairingStatusType,
    school?: string,
  ): Promise<ParentChildPairingDto[]> {
    const filter: Record<string, string> = {};
    if (status) {
      filter.status = status;
    }
    if (school) {
      filter.school = school;
    }

    const pairings = await this.parentChildPairingModel.find(filter).sort({ createdAt: -1 }).exec();

    return pairings.map((p) => ParentChildPairingService.toParentChildPairingDto(p));
  }

  async updateParentChildPairingStatus(
    pairingId: string,
    status: string,
    performedBy: string,
    lmnApiToken: string,
  ): Promise<ParentChildPairingDto> {
    const pairing = await this.parentChildPairingModel.findById(pairingId).exec();

    if (!pairing) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.CODE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        ParentChildPairingService.name,
      );
    }

    if (status === PARENT_CHILD_PAIRING_STATUS.ACCEPTED) {
      await this.lmnApiService.addParentToStudent(lmnApiToken, pairing.student, pairing.parent);
    }

    if (status === PARENT_CHILD_PAIRING_STATUS.REJECTED && pairing.status === PARENT_CHILD_PAIRING_STATUS.ACCEPTED) {
      await this.lmnApiService.deleteParentFromStudent(lmnApiToken, pairing.student, pairing.parent);
    }

    pairing.status = status as ParentChildPairingStatusType;
    pairing.logs.push({
      action: PARENT_CHILD_PAIRING_LOG_ACTION.STATUS_CHANGED,
      performedBy,
      timestamp: new Date(),
      details: status,
    });
    await pairing.save();

    Logger.log(`Parent-child pairing ${pairingId} status updated to ${status}`, ParentChildPairingService.name);

    return ParentChildPairingService.toParentChildPairingDto(pairing);
  }

  private static toParentChildPairingDto(p: {
    id?: unknown;
    parent: string;
    student: string;
    school: string;
    status: ParentChildPairingStatusType;
    logs?: { action: ParentChildPairingLogActionType; performedBy: string; timestamp: Date; details?: string }[];
    createdAt?: Date;
    updatedAt?: Date;
  }): ParentChildPairingDto {
    return {
      id: String(p.id),
      parent: p.parent,
      student: p.student,
      school: p.school,
      status: p.status,
      logs: (p.logs ?? []).map((log) => ({
        action: log.action,
        performedBy: log.performedBy,
        timestamp: log.timestamp.toISOString(),
        details: log.details,
      })),
      createdAt: p.createdAt?.toISOString() ?? '',
      updatedAt: p.updatedAt?.toISOString() ?? '',
    };
  }

  private async resolveCode(code: string): Promise<{ username: string; groups: string[]; school: string }> {
    const userKey = `${PARENT_CHILD_PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${code}`;
    const userData = await this.cacheManager.get<{ username: string; groups: string[]; school: string }>(userKey);

    if (!userData) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.CODE_EXPIRED,
        HttpStatus.GONE,
        undefined,
        ParentChildPairingService.name,
      );
    }

    return userData;
  }

  private async deleteExistingCode(username: string): Promise<void> {
    const codeKey = `${PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_KEY_PREFIX}${username}`;
    const existingCode = await this.cacheManager.get<string>(codeKey);

    if (existingCode) {
      await this.cacheManager.del(codeKey);
      await this.cacheManager.del(`${PARENT_CHILD_PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${existingCode}`);
    }
  }

  private async generateAndStoreCode(
    username: string,
    groups: string[],
    school: string,
  ): Promise<ParentChildPairingCodeResponseDto> {
    const code = randomUUID().slice(0, PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_LENGTH).toUpperCase();
    const codeKey = `${PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_KEY_PREFIX}${username}`;
    const userKey = `${PARENT_CHILD_PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${code}`;
    const expiresAt = new Date(Date.now() + PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_TTL_MS).toISOString();

    await this.cacheManager.set(codeKey, code, PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_TTL_MS);
    await this.cacheManager.set(
      userKey,
      { username, groups, school, expiresAt } satisfies CachedPairingUserData,
      PARENT_CHILD_PAIRING_CACHE_CONFIG.CODE_TTL_MS,
    );

    Logger.log(`Parent-child pairing code generated for ${username}`, ParentChildPairingService.name);

    return { code, expiresAt };
  }
}

export default ParentChildPairingService;
