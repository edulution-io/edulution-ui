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

const AVAILABLE_FILE_TYPES = {
  drawIoFile: 'drawIoFile',
  textFile: 'textFile',
  documentFile: 'documentFile',
  spreadsheetFile: 'spreadsheetFile',
  presentationFile: 'presentationFile',
} as const;

export default AVAILABLE_FILE_TYPES;
