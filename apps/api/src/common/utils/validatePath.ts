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

import path, { join } from 'path';
import { BadRequestException } from '@nestjs/common';
import PathValidationErrorMessages from '@libs/common/constants/path-validation-error-messages';
import sanitizePath from '@libs/filesystem/utils/sanitizePath';

const MAX_PATH_LENGTH = 300;

const validatePath = (base: string, value: string | string[] | null): string => {
  if (value === null) {
    throw new BadRequestException(PathValidationErrorMessages.NoString);
  }

  const raw = Array.isArray(value) ? join(...value) : value;
  const trimmed = raw?.trim();

  if (!trimmed) {
    throw new BadRequestException(PathValidationErrorMessages.IsEmpty);
  }
  if (trimmed.length > MAX_PATH_LENGTH) {
    throw new BadRequestException(PathValidationErrorMessages.PathTooLong);
  }

  const sanitized = sanitizePath(trimmed);
  const fullPath = path.resolve(base, sanitized);
  const baseResolved = path.resolve(base);

  if (!fullPath.startsWith(baseResolved + path.sep) && fullPath !== baseResolved) {
    throw new BadRequestException(PathValidationErrorMessages.OutsidePublicDirectory);
  }

  return sanitized;
};

export default validatePath;
