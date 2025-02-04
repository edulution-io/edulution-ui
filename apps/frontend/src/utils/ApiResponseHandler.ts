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

function handleError(response: Response) {
  if (response.status >= 400 && response.status < 600) {
    return { success: false, message: response.statusText, status: response.status };
  }
  return { success: false, message: 'Unexpected response', status: response.status };
}

function handleApiResponse(response: Response) {
  if (!response.ok) {
    return handleError(response);
  }
  return { success: true };
}

export default { handleApiResponse };
