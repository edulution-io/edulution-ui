/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
