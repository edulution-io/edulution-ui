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

// This DTO is based on a third-party object definition from the LMN (Linuxmuster.net) API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import type LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';

interface UserPermissions {
  'core:config:read': boolean;
  'core:config:write': boolean;
  'filesystem:read': boolean;
  'filesystem:write': boolean;
  'lm:crontab:read': boolean;
  'lm:crontab:write': boolean;
  'lm:device-manager:modify': boolean;
  'lm:device-manager:read': boolean;
  'lm:devices': boolean;
  'lm:devices:import': boolean;
  'lm:docker:change': boolean;
  'lm:docker:list': boolean;
  'lm:globalsettings': boolean;
  'lm:linbo:configs': boolean;
  'lm:linbo:examples': boolean;
  'lm:linbo:icons': boolean;
  'lm:linbo:images': boolean;
  'lm:quotas:apply': boolean;
  'lm:quotas:configure': boolean;
  'lm:quotas:ldap-search': boolean;
  'lm:samba_dns:read': boolean;
  'lm:samba_dns:write': boolean;
  'lm:schoolsettings': boolean;
  'lm:sync:list': boolean;
  'lm:sync:online': boolean;
  'lm:sync:sync': boolean;
  'lm:users:apply': boolean;
  'lm:users:check': boolean;
  'lm:users:customfields:read': boolean;
  'lm:users:customfields:write': boolean;
  'lm:users:extraclasses:read': boolean;
  'lm:users:extrastudents:read': boolean;
  'lm:users:globaladmins:create': boolean;
  'lm:users:parents:read': boolean;
  'lm:users:parents:write': boolean;
  'lm:users:passwords': boolean;
  'lm:users:schooladmins:create': boolean;
  'lm:users:staff:read': boolean;
  'lm:users:staff:write': boolean;
  'lm:users:students:read': boolean;
  'lm:users:students:write': boolean;
  'lm:users:teachers:list': boolean;
  'lm:users:teachers:read': boolean;
  'lm:users:teachers:write': boolean;
  'lm:users:users:delete': boolean;
  'lmn:clients:config': boolean;
  'lmn:groupmembership': boolean;
  'lmn:groupmemberships:write': boolean;
  'lmn:oldsession:trans': boolean;
  'lmn:session:trans': boolean;
  'sidebar:view:/view/dashboard': boolean;
  'sidebar:view:/view/lmn/crontab': boolean;
  'sidebar:view:/view/lmn/device-manager': boolean;
  'sidebar:view:/view/lmn/devices': boolean;
  'sidebar:view:/view/lmn/dhcp': boolean;
  'sidebar:view:/view/lmn/docker': boolean;
  'sidebar:view:/view/lmn/globalsettings': boolean;
  'sidebar:view:/view/lmn/groupmembership': boolean;
  'sidebar:view:/view/lmn/home': boolean;
  'sidebar:view:/view/lmn/landingpage': boolean;
  'sidebar:view:/view/lmn/linbo4': boolean;
  'sidebar:view:/view/lmn/linbo_sync': boolean;
  'sidebar:view:/view/lmn/links': boolean;
  'sidebar:view:/view/lmn/nextcloud': boolean;
  'sidebar:view:/view/lmn/oldsession': boolean;
  'sidebar:view:/view/lmn/quotas': boolean;
  'sidebar:view:/view/lmn/samba_dns': boolean;
  'sidebar:view:/view/lmn/schoolsettings': boolean;
  'sidebar:view:/view/lmn/session': boolean;
  'sidebar:view:/view/lmn/sessionsList': boolean;
  'sidebar:view:/view/lmn/users/globaladmins': boolean;
  'sidebar:view:/view/lmn/users/listmanagement': boolean;
  'sidebar:view:/view/lmn/users/parents': boolean;
  'sidebar:view:/view/lmn/users/print-passwords': boolean;
  'sidebar:view:/view/lmn/users/schooladmins': boolean;
  'sidebar:view:/view/lmn/users/staff': boolean;
  'sidebar:view:/view/lmn/users/students': boolean;
  'sidebar:view:/view/lmn/users/teachers': boolean;
  'sidebar:view:/view/lmn/websession': boolean;
  'sidebar:view:/view/lmn/wireguard': boolean;
  'sidebar:view:/view/lmn_clients': boolean;
}

interface CustomFieldValue {
  title: string;
  canRead: boolean;
  canWrite: boolean;
  value: string | string[];
}

interface CustomFields {
  proxyAddresses: CustomFieldValue;
  sophomorixCustom1: CustomFieldValue;
  sophomorixCustom2: CustomFieldValue;
  sophomorixCustom3: CustomFieldValue;
  sophomorixCustom4: CustomFieldValue;
  sophomorixCustomMulti1: CustomFieldValue;
  sophomorixCustomMulti2: CustomFieldValue;
  sophomorixCustomMulti3: CustomFieldValue;
  sophomorixCustomMulti4: CustomFieldValue;
}

interface LmnUserInfo {
  cn: string;
  displayName: string;
  distinguishedName: string;
  givenName: string;
  homeDirectory: string;
  homeDrive: string;
  mail: string[];
  memberOf: string[];
  name: string;
  objectClass?: string[];
  preferredLanguage?: string;
  proxyAddresses: string[];
  sAMAccountName: string;
  sAMAccountType: string;
  sn: string;
  sophomorixAdminClass: string;
  sophomorixAdminFile: string;
  sophomorixBirthdate: string;
  sophomorixCloudQuotaCalculated: string[];
  sophomorixComment: string;
  sophomorixCreationDate: string;
  sophomorixCustom1: string;
  sophomorixCustom2: string;
  sophomorixCustom3: string;
  sophomorixCustom4: string;
  sophomorixCustom5: string;
  sophomorixCustomMulti1: string[];
  sophomorixCustomMulti2: string[];
  sophomorixCustomMulti3: string[];
  sophomorixCustomMulti4: string[];
  sophomorixCustomMulti5: string[];
  sophomorixDeactivationDate: string;
  sophomorixExamMode: string[];
  sophomorixExitAdminClass: string;
  sophomorixFirstnameASCII: string;
  sophomorixFirstnameInitial: string;
  sophomorixFirstPassword: string;
  sophomorixIntrinsic1?: string;
  sophomorixIntrinsic2: string | string[];
  sophomorixIntrinsic3: string | string[];
  sophomorixIntrinsic4?: string;
  sophomorixIntrinsic5?: string;
  sophomorixIntrinsicMulti1?: string[];
  sophomorixIntrinsicMulti2?: string[];
  sophomorixIntrinsicMulti3?: string[];
  sophomorixIntrinsicMulti4?: string[];
  sophomorixIntrinsicMulti5?: string[];
  sophomorixMailQuota?: string[];
  sophomorixMailQuotaCalculated: string[];
  sophomorixMailQuotaUsed: string[];
  sophomorixQuota: string[];
  sophomorixRole: (typeof SOPHOMORIX_GROUP_TYPES)['STUDENT' | 'TEACHER'];
  sophomorixSchoolname: string;
  sophomorixSchoolPrefix: string;
  sophomorixSessions: string[];
  sophomorixStatus: string;
  sophomorixSurnameASCII: string;
  sophomorixSurnameInitial: string;
  sophomorixTolerationDate: string;
  sophomorixUnid: string;
  sophomorixUserToken: string;
  sophomorixWebuiDashboard: string[];
  sophomorixWebuiPermissionsCalculated: string[];
  thumbnailPhoto: string;
  unixHomeDirectory: string;
  userAccountControl?: number;
  whenChanged?: string;
  dn: string;
  children?: unknown[];
  customFields?: CustomFields;
  examMode: boolean;
  examTeacher: '';
  examBaseCn: '';
  internet: boolean;
  intranet: boolean;
  isAdmin: boolean;
  lmnsessions: LmnApiSession[];
  parents?: string[];
  permissions: UserPermissions;
  printers: string[];
  printing: boolean;
  projects: string[];
  schoolclasses: string[];
  school: string;
  webfilter: boolean;
  wifi: boolean;
  FirstPasswordSet?: boolean;
}

export default LmnUserInfo;
