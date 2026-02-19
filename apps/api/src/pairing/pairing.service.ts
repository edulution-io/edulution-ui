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
import PAIRING_STATUS from '@libs/pairing/constants/pairingStatus';
import PAIRING_ERROR_MESSAGES from '@libs/pairing/constants/pairingErrorMessages';
import type PairingDto from '@libs/pairing/types/pairingDto';
import PAIRING_CACHE_CONFIG from '@libs/pairing/constants/pairingCacheConfig';
import CustomHttpException from '../common/CustomHttpException';
import { Pairing, PairingDocument } from './pairing.schema';

@Injectable()
class PairingService {
  constructor(
    @InjectModel(Pairing.name) private readonly pairingModel: Model<PairingDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async getOrCreateCode(username: string, groups: string[]): Promise<string> {
    const codeKey = `${PAIRING_CACHE_CONFIG.CODE_KEY_PREFIX}${username}`;
    const existingCode = await this.cacheManager.get<string>(codeKey);

    if (existingCode) {
      return existingCode;
    }

    return this.generateAndStoreCode(username, groups);
  }

  async refreshCode(username: string, groups: string[]): Promise<string> {
    await this.deleteExistingCode(username);
    return this.generateAndStoreCode(username, groups);
  }

  async createPairing(username: string, groups: string[], code: string): Promise<PairingDto> {
    const target = await this.resolveCode(code);

    if (username === target.username) {
      throw new CustomHttpException(
        PAIRING_ERROR_MESSAGES.CANNOT_PAIR_WITH_SELF,
        HttpStatus.BAD_REQUEST,
        undefined,
        PairingService.name,
      );
    }

    const callerIsParent = groups.includes(GroupRoles.PARENT);
    const callerIsStudent = groups.includes(GroupRoles.STUDENT);

    if (!callerIsParent && !callerIsStudent) {
      throw new CustomHttpException(
        PAIRING_ERROR_MESSAGES.INVALID_ROLE,
        HttpStatus.FORBIDDEN,
        undefined,
        PairingService.name,
      );
    }

    const targetIsParent = target.groups.includes(GroupRoles.PARENT);
    const targetIsStudent = target.groups.includes(GroupRoles.STUDENT);

    if (!targetIsParent && !targetIsStudent) {
      throw new CustomHttpException(
        PAIRING_ERROR_MESSAGES.INVALID_ROLE,
        HttpStatus.FORBIDDEN,
        undefined,
        PairingService.name,
      );
    }

    const hasParent = callerIsParent || targetIsParent;
    const hasStudent = callerIsStudent || targetIsStudent;

    if (!hasParent || !hasStudent) {
      throw new CustomHttpException(
        PAIRING_ERROR_MESSAGES.INCOMPATIBLE_ROLES,
        HttpStatus.BAD_REQUEST,
        undefined,
        PairingService.name,
      );
    }

    const parent = callerIsParent ? username : target.username;
    const student = callerIsStudent ? username : target.username;

    const existingPairing = await this.pairingModel.findOne({ parent, student }).lean({ virtuals: true });
    if (existingPairing) {
      throw new CustomHttpException(
        PAIRING_ERROR_MESSAGES.PAIRING_ALREADY_EXISTS,
        HttpStatus.CONFLICT,
        undefined,
        PairingService.name,
      );
    }

    const pairing = await this.pairingModel.create({
      parent,
      student,
      status: PAIRING_STATUS.PENDING,
    });

    Logger.log(`Pairing created: ${parent} <-> ${student}`, PairingService.name);

    return {
      id: String(pairing.id),
      parent: pairing.parent,
      student: pairing.student,
      status: pairing.status,
      createdAt: pairing.createdAt.toISOString(),
      updatedAt: pairing.updatedAt.toISOString(),
    };
  }

  async getRelationships(username: string, groups: string[]): Promise<PairingDto[]> {
    const isParent = groups.includes(GroupRoles.PARENT);
    const isStudent = groups.includes(GroupRoles.STUDENT);

    const filter: Record<string, string> = {};
    if (isParent) {
      filter.parent = username;
    } else if (isStudent) {
      filter.student = username;
    }

    const pairings = await this.pairingModel.find(filter).lean({ virtuals: true });

    return pairings.map((p) => ({
      id: String(p.id),
      parent: p.parent,
      student: p.student,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  private async resolveCode(code: string): Promise<{ username: string; groups: string[] }> {
    const userKey = `${PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${code}`;
    const userData = await this.cacheManager.get<{ username: string; groups: string[] }>(userKey);

    if (!userData) {
      throw new CustomHttpException(
        PAIRING_ERROR_MESSAGES.CODE_EXPIRED,
        HttpStatus.GONE,
        undefined,
        PairingService.name,
      );
    }

    return userData;
  }

  private async deleteExistingCode(username: string): Promise<void> {
    const codeKey = `${PAIRING_CACHE_CONFIG.CODE_KEY_PREFIX}${username}`;
    const existingCode = await this.cacheManager.get<string>(codeKey);

    if (existingCode) {
      await this.cacheManager.del(codeKey);
      await this.cacheManager.del(`${PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${existingCode}`);
    }
  }

  private async generateAndStoreCode(username: string, groups: string[]): Promise<string> {
    const code = randomUUID().slice(0, PAIRING_CACHE_CONFIG.CODE_LENGTH).toUpperCase();
    const codeKey = `${PAIRING_CACHE_CONFIG.CODE_KEY_PREFIX}${username}`;
    const userKey = `${PAIRING_CACHE_CONFIG.USER_KEY_PREFIX}${code}`;

    await this.cacheManager.set(codeKey, code, PAIRING_CACHE_CONFIG.CODE_TTL_MS);
    await this.cacheManager.set(userKey, { username, groups }, PAIRING_CACHE_CONFIG.CODE_TTL_MS);

    Logger.log(`Pairing code generated for ${username}`, PairingService.name);

    return code;
  }
}

export default PairingService;
