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

import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { pathExists } from 'fs-extra';
import { join } from 'path';
import sharp from 'sharp';
import PROFILE_PICTURE_CONFIG from '@libs/chat/constants/profilePictureConfig';
import PROFILE_PICTURE_CACHE_PATH from '@libs/chat/constants/profilePictureCachePath';
import { GROUP_WITH_MEMBERS_CACHE_KEY, USER_GROUPS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { Group } from '@libs/groups/types/group';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import FilesystemService from '../filesystem/filesystem.service';

interface ProfilePictureResult {
  buffer: Buffer;
  etag: string;
}

@Injectable()
class ProfilePictureService implements OnModuleInit {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async onModuleInit(): Promise<void> {
    try {
      await FilesystemService.ensureDirectoryExists(PROFILE_PICTURE_CACHE_PATH);
      Logger.debug(
        `Profile picture cache directory ensured at: ${PROFILE_PICTURE_CACHE_PATH}`,
        ProfilePictureService.name,
      );
    } catch (error) {
      Logger.error(`Failed to create profile picture cache directory: ${error}`, ProfilePictureService.name);
    }
  }

  async getProfilePicture(username: string): Promise<ProfilePictureResult | null> {
    const filePath = ProfilePictureService.getFilePath(username);

    const exists = await pathExists(filePath);
    if (!exists) return null;

    try {
      const buffer = await FilesystemService.readFile(filePath);
      const etag = ProfilePictureService.computeEtag(buffer);
      return { buffer, etag };
    } catch (error) {
      Logger.warn(`Failed to read profile picture for ${username}: ${error}`, ProfilePictureService.name);
      return null;
    }
  }

  async saveProfilePicture(username: string, base64Data: string): Promise<void> {
    const filePath = ProfilePictureService.getFilePath(username);

    if (!base64Data) {
      try {
        const exists = await pathExists(filePath);
        if (exists) {
          const { unlink } = await import('fs-extra');
          await unlink(filePath);
        }
      } catch (error) {
        Logger.warn(`Failed to delete profile picture for ${username}: ${error}`, ProfilePictureService.name);
      }
      return;
    }

    try {
      const rawBuffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const compressed = await sharp(rawBuffer)
        .resize(PROFILE_PICTURE_CONFIG.SIZE, PROFILE_PICTURE_CONFIG.SIZE, {
          fit: 'cover',
          position: 'center',
        })
        .webp({ quality: PROFILE_PICTURE_CONFIG.QUALITY })
        .toBuffer();

      await sharp(compressed).toFile(filePath);
      Logger.debug(`Profile picture saved for ${username}`, ProfilePictureService.name);
    } catch (error) {
      Logger.error(`Failed to save profile picture for ${username}: ${error}`, ProfilePictureService.name);
    }
  }

  async isAllowedToView(requestingUsername: string, targetUsername: string): Promise<boolean> {
    if (requestingUsername === targetUsername) return true;

    const userGroups = await this.cacheManager.get<Group[]>(`${USER_GROUPS_CACHE_KEY}${requestingUsername}`);
    if (!userGroups) return false;

    const groupChecks = userGroups.map(async (group) => {
      const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
        `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
      );
      return groupWithMembers?.members?.some((member) => member.username === targetUsername) ?? false;
    });

    const results = await Promise.all(groupChecks);
    return results.some(Boolean);
  }

  async getGroupMembers(username: string): Promise<string[]> {
    const userGroups = await this.cacheManager.get<Group[]>(`${USER_GROUPS_CACHE_KEY}${username}`);
    if (!userGroups) return [];

    const memberSets = await Promise.all(
      userGroups.map(async (group) => {
        const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
          `${GROUP_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
        );
        return groupWithMembers?.members?.map((member) => member.username) ?? [];
      }),
    );

    return [...new Set(memberSets.flat())];
  }

  private static getFilePath(username: string): string {
    const safeUsername = username.replace(/[^a-zA-Z0-9._-]/g, '_');
    return join(PROFILE_PICTURE_CACHE_PATH, `${safeUsername}.${PROFILE_PICTURE_CONFIG.FORMAT}`);
  }

  private static computeEtag(buffer: Buffer): string {
    const hash = createHash('sha256').update(buffer).digest('hex').slice(0, 16);
    return `"${hash}"`;
  }
}

export default ProfilePictureService;
