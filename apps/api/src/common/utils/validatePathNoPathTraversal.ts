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

import { pathExists } from 'fs-extra';
import path from 'node:path';
import fs from 'node:fs/promises';
import { HttpStatus, Logger } from '@nestjs/common';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import PathValidationErrorMessages from '@libs/common/constants/path-validation-error-messages';

const validatePathNoPathTraversal = async (
  filePath: string,
  basePath: string,
  domain?: string,
  opts?: {
    maxLength?: number;
    mustExist?: boolean;
    followSymlinks?: boolean;
    allowSubdirs?: boolean;
    allowAbsolute?: boolean;
  },
): Promise<void> => {
  const {
    maxLength = 300,
    mustExist = true,
    followSymlinks = true,
    allowSubdirs = true,
    allowAbsolute = true,
  } = opts ?? {};
  const raw = filePath.trim();
  if (!raw) {
    Logger.warn(`Suspicious path detected: FilePath is an empty string.`);
    throw new CustomHttpException(PathValidationErrorMessages.IsEmpty, HttpStatus.BAD_REQUEST, raw, domain);
  }
  if (raw.length > maxLength) {
    Logger.warn(`Suspicious path detected: FilePath: ${raw} exceeds maximum length of ${maxLength}.`);
    throw new CustomHttpException(PathValidationErrorMessages.PathTooLong, HttpStatus.BAD_REQUEST, raw, domain);
  }

  const unified = raw.replace(/\\/g, '/');

  if (!allowSubdirs && unified.includes('/')) {
    Logger.warn(`Suspicious path detected: FilePath: ${unified} includes subdirectories which are not allowed.`);
    throw new CustomHttpException(
      PathValidationErrorMessages.SubdirectoriesNotAllowed,
      HttpStatus.BAD_REQUEST,
      raw,
      domain,
    );
  }

  if (!allowAbsolute && (path.isAbsolute(raw) || path.win32.isAbsolute(raw) || unified.startsWith('//'))) {
    Logger.warn(`Suspicious path detected: FilePath: ${unified} includes absolute paths which are not allowed.`);
    throw new CustomHttpException(
      PathValidationErrorMessages.AbsolutePathNotAllowed,
      HttpStatus.BAD_REQUEST,
      unified,
      domain,
    );
  }

  const normalized = path.posix.normalize(`/${unified}`).slice(1);

  if (normalized === '..' || normalized.startsWith('../') || normalized.includes('/../../')) {
    Logger.warn(`Suspicious path detected: FilePath: ${normalized} includes path traversal sequences.`);
    throw new CustomHttpException(
      PathValidationErrorMessages.PathTraversal,
      HttpStatus.BAD_REQUEST,
      normalized,
      domain,
    );
  }

  if (!/^[A-Za-z0-9._/-]+$/.test(normalized)) {
    Logger.warn(`Suspicious path detected: ${normalized} includes invalid characters.`);
    throw new CustomHttpException(
      PathValidationErrorMessages.InvalidCharacters,
      HttpStatus.BAD_REQUEST,
      normalized,
      domain,
    );
  }

  const publicBaseAbsolutePath = path.resolve(basePath);
  const fileAbsolutePath = path.resolve(normalized);
  const baseWithSep = publicBaseAbsolutePath.endsWith(path.sep)
    ? publicBaseAbsolutePath
    : publicBaseAbsolutePath + path.sep;
  if (fileAbsolutePath !== publicBaseAbsolutePath && !fileAbsolutePath.startsWith(baseWithSep)) {
    Logger.warn(`Suspicious path detected: ${fileAbsolutePath} is outside the public directory.`);
    throw new CustomHttpException(
      PathValidationErrorMessages.OutsidePublicDirectory,
      HttpStatus.BAD_REQUEST,
      normalized,
      domain,
    );
  }

  if (!followSymlinks) {
    try {
      const realBase = await fs.realpath(publicBaseAbsolutePath);
      const realFilePath = await fs.realpath(fileAbsolutePath);
      const realBaseWithSep = realBase.endsWith(path.sep) ? realBase : realBase + path.sep;
      if (realFilePath !== realBase && !realFilePath.startsWith(realBaseWithSep)) {
        Logger.warn(
          `Suspicious path detected: ${realFilePath} includes a symlink, linking outside the public directory.`,
        );
        throw new CustomHttpException(
          PathValidationErrorMessages.SymlinkOutsidePublicDirectory,
          HttpStatus.BAD_REQUEST,
          realFilePath,
          domain,
        );
      }
    } catch (err) {
      if (mustExist) {
        Logger.warn(`Suspicious path detected: ${fileAbsolutePath} realpath failed, does the file exist?`);
        throw new CustomHttpException(
          PathValidationErrorMessages.SymlinkOutsidePublicDirectory,
          HttpStatus.BAD_REQUEST,
          fileAbsolutePath,
          domain,
        );
      }
    }
  } else if (mustExist) {
    await pathExists(fileAbsolutePath);
  }
};

export default validatePathNoPathTraversal;
