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

export const encodeBase64 = (str: string) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary);
};

export const decodeBase64 = (b64: string) => {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
};
