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

import GroupRoles from '@libs/groups/types/group-roles.enum';
import getIsAdmin from './getIsAdmin';

describe('getIsAdmin', () => {
  it.each([
    {
      description: 'returns true when ldapGroups includes SUPER_ADMIN',
      ldapGroups: [GroupRoles.SUPER_ADMIN, '/role-teacher'],
      adminGroups: [],
      expected: true,
    },
    {
      description: 'returns true when ldapGroups includes an adminGroup',
      ldapGroups: ['/role-teacher', '/custom-admin-group'],
      adminGroups: ['/custom-admin-group'],
      expected: true,
    },
    {
      description: 'returns false when no matching groups',
      ldapGroups: ['/role-teacher', '/role-student'],
      adminGroups: ['/custom-admin-group'],
      expected: false,
    },
    {
      description: 'returns false when both arrays are empty',
      ldapGroups: [],
      adminGroups: [],
      expected: false,
    },
    {
      description: 'returns false when ldapGroups is empty',
      ldapGroups: [],
      adminGroups: ['/custom-admin-group'],
      expected: false,
    },
    {
      description: 'handles undefined adminGroups gracefully',
      ldapGroups: ['/role-teacher'],
      adminGroups: undefined as unknown as string[],
      expected: false,
    },
    {
      description: 'handles null adminGroups gracefully',
      ldapGroups: ['/role-teacher'],
      adminGroups: null as unknown as string[],
      expected: false,
    },
    {
      description: 'returns true when SUPER_ADMIN present even with empty adminGroups',
      ldapGroups: [GroupRoles.SUPER_ADMIN],
      adminGroups: [],
      expected: true,
    },
  ])('$description', ({ ldapGroups, adminGroups, expected }) => {
    expect(getIsAdmin(ldapGroups, adminGroups)).toBe(expected);
  });
});
