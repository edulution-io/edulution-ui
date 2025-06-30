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

const isSubsequence = (pattern: string, text: string): boolean => {
  let patternIndex = 0;
  let textIndex = 0;

  while (patternIndex < pattern.length && textIndex < text.length) {
    if (pattern[patternIndex] === text[textIndex]) {
      patternIndex += 1;
    }
    textIndex += 1;
  }

  return patternIndex === pattern.length;
};

export default isSubsequence;
