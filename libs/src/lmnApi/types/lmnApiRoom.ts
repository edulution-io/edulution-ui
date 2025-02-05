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
interface LmnApiRoom {
  usersList: string[];
  name: string;
  objects: { [key: string]: ObjectDetail };
}

interface ObjectDetail {
  PORT: string;
  ROOM: string;
  IP: string;
  SMBSTATUS_LINE: string;
  IPV4: string;
  COMPUTER: string | null;
}

export default LmnApiRoom;
