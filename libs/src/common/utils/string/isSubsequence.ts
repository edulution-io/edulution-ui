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

const isSubsequence = (needle: string, haystack: string): boolean => {
  let i = 0;
  let j = 0;

  while (i < needle.length && j < haystack.length) {
    if (needle[i] === haystack[j]) i += 1;

    j += 1;
  }

  return i === needle.length;
};

export default isSubsequence;
