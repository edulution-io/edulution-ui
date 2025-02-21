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

interface UpdateUserDetailsDto {
  givenName: string;
  displayName: string;
  mailalias: boolean;
  name: string;
  proxyAddresses: string[];
  sn: string;
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
  thumbnailPhoto: string;
}

export default UpdateUserDetailsDto;
