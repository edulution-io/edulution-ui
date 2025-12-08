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

// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import SophomorixGroupTypes from '@libs/lmnApi/types/sophomorixGroupTypes';

interface LmnApiSearchResult {
  cn: string;
  description: string;
  displayName: string;
  distinguishedName: string;
  givenName: string;
  mail: string;
  sAMAccountName: string;
  sAMAccountType: number;
  sn: string;
  sophomorixAddMailQuota: string;
  sophomorixAddQuota: string[];
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixJoinable: boolean;
  sophomorixMailAlias: boolean;
  sophomorixMailList: boolean;
  sophomorixMailQuota: string;
  sophomorixQuota: string;
  sophomorixRole: string;
  sophomorixSchoolname: string;
  sophomorixSchoolPrefix: string;
  sophomorixStatus: string;
  dn: string;
  type: SophomorixGroupTypes;
}

export default LmnApiSearchResult;
