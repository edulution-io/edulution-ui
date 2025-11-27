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

import SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixSchoolClassGroupTypes';

const SOPHOMORIX_OTHER_GROUP_TYPES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  PROJECT: 'project',
  UNKNOWN: 'unknown',
  DEVICE: 'device',
  GLOBALBINDUSER: 'globalbinduser',
  GLOBALADMINISTRATOR: 'globaladministrator',
  SCHOOLBINDUSER: 'schoolbinduser',
  SCHOOLADMINISTRATOR: 'schooladministrator',
  CLASSROOM_STUDENTCOMPUTER: 'classroom-studentcomputer',
  SERVER: 'server',
  PRINTER: 'printer',
} as const;

const SOPHOMORIX_GROUP_TYPES = {
  ...SOPHOMORIX_SCHOOL_CLASS_GROUP_TYPES,
  ...SOPHOMORIX_OTHER_GROUP_TYPES,
} as const;

export default SOPHOMORIX_GROUP_TYPES;
