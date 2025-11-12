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

import { v4 as uuidv4 } from 'uuid';

const STR_DISTINGUISHER = '_--_';

export const addUuidToFileName = (originalFileName: string): string => {
  const dotIndex = originalFileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return originalFileName;
  }

  const name = originalFileName.slice(0, dotIndex);
  const ext = originalFileName.slice(dotIndex + 1);

  return `${name}${STR_DISTINGUISHER}${uuidv4()}.${ext}`;
};

export const removeUuidFromFileName = (fileName: string): string => {
  const dotIndex = fileName.lastIndexOf('.');
  if (dotIndex === -1) {
    return fileName;
  }

  const name = fileName.slice(0, dotIndex);
  const ext = fileName.slice(dotIndex + 1);

  const distinguisherIndex = name.lastIndexOf(STR_DISTINGUISHER);
  if (distinguisherIndex === -1) {
    return fileName;
  }

  return `${name.slice(0, distinguisherIndex)}.${ext}`;
};
