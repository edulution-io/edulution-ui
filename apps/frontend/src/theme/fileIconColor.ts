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

interface FileIconColors {
  [key: string]: string;
}

const fileIconColors: FileIconColors = {
  document: 'green-500',
  image: 'yellow-400',
  audio: 'blue-500',
  video: 'ciRed',
  code: 'purple-500',
  acrobat: 'pink-500',
  default: 'gray-400',
};

export default fileIconColors;
