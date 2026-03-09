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

import type UserDto from '@libs/user/types/user.dto';
import type LdapGroups from '@libs/groups/types/ldapGroups';

const DEFAULT_LDAP_GROUPS: LdapGroups = {
  schools: ['default-school'],
  projects: [],
  projectPaths: [],
  classes: ['cn=10a,ou=classes,dc=schule,dc=de'],
  classPaths: ['/classes/10a'],
  roles: ['cn=teachers,ou=groups,dc=schule,dc=de'],
  others: [],
};

const USER_DEFAULTS: UserDto = {
  _id: '507f1f77bcf86cd799439011',
  username: 'max.mustermann',
  firstName: 'Max',
  lastName: 'Mustermann',
  email: 'max.mustermann@realschule-musterstadt.de',
  ldapGroups: DEFAULT_LDAP_GROUPS,
  password: 'hashed-password-placeholder',
  encryptKey: 'encrypt-key-placeholder',
  mfaEnabled: false,
  language: 'de',
  registeredPushTokens: [],
};

const createUser = (overrides: Partial<UserDto> = {}): UserDto => ({
  ...USER_DEFAULTS,
  ...overrides,
  ldapGroups: {
    ...USER_DEFAULTS.ldapGroups,
    ...(overrides.ldapGroups ?? {}),
  },
});

const createAdminUser = (overrides: Partial<UserDto> = {}): UserDto =>
  createUser({
    username: 'admin.schulleitung',
    firstName: 'Admin',
    lastName: 'Schulleitung',
    email: 'admin@gymnasium-beispiel.de',
    ldapGroups: {
      ...DEFAULT_LDAP_GROUPS,
      roles: ['cn=admins,ou=groups,dc=schule,dc=de', 'cn=teachers,ou=groups,dc=schule,dc=de'],
    },
    ...overrides,
  });

export { createAdminUser };
export default createUser;
