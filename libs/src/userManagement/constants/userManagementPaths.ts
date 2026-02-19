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

import USER_TYPES from './userTypes';

export const LINUXMUSTER_PATH = 'linuxmuster';

export const USER_MANAGEMENT_LOCATION = 'usermanagement';
export const USER_MANAGEMENT_PATH = `${LINUXMUSTER_PATH}/${USER_MANAGEMENT_LOCATION}`;

export const USER_MANAGEMENT_STUDENTS_LOCATION = USER_TYPES.STUDENTS;
export const USER_MANAGEMENT_STUDENTS_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_STUDENTS_LOCATION}`;

export const USER_MANAGEMENT_TEACHERS_LOCATION = USER_TYPES.TEACHERS;
export const USER_MANAGEMENT_TEACHERS_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_TEACHERS_LOCATION}`;

export const USER_MANAGEMENT_EXTRASTUDENTS_LOCATION = USER_TYPES.EXTRASTUDENTS;
export const USER_MANAGEMENT_EXTRASTUDENTS_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_EXTRASTUDENTS_LOCATION}`;

export const USER_MANAGEMENT_PARENTS_LOCATION = USER_TYPES.PARENTS;
export const USER_MANAGEMENT_PARENTS_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_PARENTS_LOCATION}`;

export const USER_MANAGEMENT_STAFF_LOCATION = USER_TYPES.STAFF;
export const USER_MANAGEMENT_STAFF_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_STAFF_LOCATION}`;

export const USER_MANAGEMENT_SCHOOLADMINS_LOCATION = USER_TYPES.SCHOOLADMINS;
export const USER_MANAGEMENT_SCHOOLADMINS_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_SCHOOLADMINS_LOCATION}`;

export const USER_MANAGEMENT_GLOBALADMINS_LOCATION = USER_TYPES.GLOBALADMINS;
export const USER_MANAGEMENT_GLOBALADMINS_PATH = `${USER_MANAGEMENT_PATH}/${USER_MANAGEMENT_GLOBALADMINS_LOCATION}`;

export const PAIRING_ASSIGNMENT_LOCATION = 'pairing-assignment';
export const PAIRING_ASSIGNMENT_PATH = `${LINUXMUSTER_PATH}/${PAIRING_ASSIGNMENT_LOCATION}`;
