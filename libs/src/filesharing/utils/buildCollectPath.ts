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

import buildNewCollectFolderName from '@libs/filesharing/utils/buildNewCollectFolderName';
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import CollectFileRequestDTO from '@libs/filesharing/types/CollectFileRequestDTO';
import UserRoles from '@libs/user/constants/userRoles';
import FILE_PATHS from '../constants/file-paths';
import normalizeLdapHomeDirectory from './normalizeLdapHomeDirectory';

const buildCollectPath = (
  username: string,
  homePath: string,
  schoolClass: string,
  student: LmnUserInfo,
): CollectFileRequestDTO => {
  const newFolderName = buildNewCollectFolderName(schoolClass);

  const studentName = student.examMode ? `${student.cn}-exam` : student.cn;

  const studentOriginPath = student.examMode
    ? `/${UserRoles.EXAM_USER}/${studentName}`
    : normalizeLdapHomeDirectory(student?.homeDirectory);

  const destinationPath = `${homePath}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}/${newFolderName}/${studentName}/${FILE_PATHS.COLLECT}/`;
  const originPath = `${studentOriginPath}/${FILE_PATHS.TRANSFER}/${username}/${FILE_PATHS.COLLECT}/`;

  return {
    destinationPath,
    originPath,
    userName: studentName,
    newFolderName,
  };
};

export default buildCollectPath;
