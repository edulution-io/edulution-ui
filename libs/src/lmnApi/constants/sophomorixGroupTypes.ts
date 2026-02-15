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

const SOPHOMORIX_GROUP_TYPES = {
  ADMIN_CLASS: 'adminclass',
  TEACHER_CLASS: 'teacherclass',
  EXTRA_CLASS: 'extraclass',
  PROJECT: 'project',
  SOPHOMORIX_GROUP: 'sophomorix-group',

  ROOM: 'room',
  PRINTER: 'printer',
  ADMINS: 'admins',
  SCHOOL: 'school',
  POWER_GROUP: 'powergroup',

  OU_CLASS: 'ouclass',
  ALL_CLASS: 'allclass',
  ALL_SCHOOL: 'allschool',
  ALL_ADMINS: 'alladmins',

  INTERNET_ACCESS: 'internetaccess',
  WIFI_ACCESS: 'wifiaccess',
  WEBFILTER: 'webfilter',
  INTRANET_ACCESS: 'intranetaccess',
  PRINTING: 'printing',

  STUDENT: 'student',
  TEACHER: 'teacher',
  DEVICE: 'device',
  UNKNOWN: 'unknown',
  GLOBALBINDUSER: 'globalbinduser',
  GLOBALADMINISTRATOR: 'globaladministrator',
  SCHOOLBINDUSER: 'schoolbinduser',
  SCHOOLADMINISTRATOR: 'schooladministrator',
  CLASSROOM_STUDENTCOMPUTER: 'classroom-studentcomputer',
  SERVER: 'server',

  SCHOOL_CLASS: 'schoolclass',
  PARENTS: 'parents',
  TEACHERS: 'teachers',
  STAFF_MEMBERS: 'staffmembers',
  DEVICES: 'devices',
  PROJECTS: 'projects',
  STUDENTS: 'students',
} as const;

export default SOPHOMORIX_GROUP_TYPES;
