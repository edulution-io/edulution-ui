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

// This type is based on a third-party object definition from the LDAP API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';

interface LmnApiSchoolClass {
  cn: string;
  description: string;
  distinguishedName: string;
  displayName: string;
  mail: string[];
  member: string[];
  memberOf: string[];
  proxyAddresses: string[];
  name: string;
  sAMAccountName: string;
  sAMAccountType: string;
  sophomorixAddMailQuota: string[];
  sophomorixAddQuota: string[];
  sophomorixAdmins: string[];
  sophomorixCreationDate: string;
  sophomorixHidden: boolean;
  sophomorixJoinable: boolean;
  sophomorixMailAlias: boolean;
  sophomorixMailList: boolean;
  sophomorixMailQuota: string[];
  sophomorixMaxMembers: number;
  sophomorixMembers: string[];
  sophomorixQuota: string[];
  sophomorixSchoolname: string;
  sophomorixStatus: string;
  sophomorixType: string;
  membersCount: number;
  dn: string;
  members: LmnUserInfo[];
}

export default LmnApiSchoolClass;
