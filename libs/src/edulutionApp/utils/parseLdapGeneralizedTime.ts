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

const parseLdapGeneralizedTime = (ldapTimeString?: string | null, treatEpochAsEmpty = true): string => {
  if (!ldapTimeString) return '';

  const m = ldapTimeString.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\.\d+)?Z$/);
  if (!m) return '';

  const [, y, mo, d, h, mi, se] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi, +se));

  if (treatEpochAsEmpty && date.getTime() === 0) {
    return '';
  }
  return date.toISOString();
};

export default parseLdapGeneralizedTime;
