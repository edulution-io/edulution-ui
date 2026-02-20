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
import type ParentChildPairingDto from '@libs/parent-child-pairing/types/parentChildPairingDto';
import PARENT_CHILD_PAIRING_CACHE_CONFIG from '@libs/parent-child-pairing/constants/parentChildPairingCacheConfig';
import type ParentChildPairingCodeResponseDto from '@libs/parent-child-pairing/types/parentChildPairingCodeResponseDto';
import type ParentChildPairingStatusType from '@libs/parent-child-pairing/types/parentChildPairingStatusType';
import CustomHttpException from '../common/CustomHttpException';
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

    const callerIsParent = groups.includes(GroupRoles.PARENT);
    const callerIsStudent = groups.includes(GroupRoles.STUDENT);

    if (!callerIsParent && !callerIsStudent) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.INVALID_ROLE,
        HttpStatus.FORBIDDEN,
        undefined,
        ParentChildPairingService.name,
      );
    }

    const targetIsParent = target.groups.includes(GroupRoles.PARENT);
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
    });

    Logger.log(
      `Parent-child pairing created: ${parent} <-> ${student} (school: ${school})`,
      ParentChildPairingService.name,
    );

    return ParentChildPairingService.toParentChildPairingDto(parentChildPairing);
  }

  async getRelationships(username: string, groups: string[]): Promise<ParentChildPairingDto[]> {
    const isParent = groups.includes(GroupRoles.PARENT);
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

  async updateParentChildPairingStatus(pairingId: string, status: string): Promise<ParentChildPairingDto> {
    const parentChildPairing = await this.parentChildPairingModel
      .findByIdAndUpdate(pairingId, { status }, { new: true })
      .exec();

    if (!parentChildPairing) {
      throw new CustomHttpException(
        PARENT_CHILD_PAIRING_ERROR_MESSAGES.CODE_NOT_FOUND,
        HttpStatus.NOT_FOUND,
        undefined,
        ParentChildPairingService.name,
      );
    }

    Logger.log(`Parent-child pairing ${pairingId} status updated to ${status}`, ParentChildPairingService.name);

    return ParentChildPairingService.toParentChildPairingDto(parentChildPairing);
  }

  private static toParentChildPairingDto(p: {
    id?: unknown;
    parent: string;
    student: string;
    school: string;
    status: ParentChildPairingStatusType;
    createdAt?: Date;
    updatedAt?: Date;
  }): ParentChildPairingDto {
    return {
      id: String(p.id),
      parent: p.parent,
      student: p.student,
      school: p.school,
      status: p.status,
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
