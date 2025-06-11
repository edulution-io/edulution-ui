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

export const usernameRegex = '[ßÄÖÜäöüa-zA-Z0-9.\\-\\s]{1,20}';

export const publicUserNameRegex = new RegExp(`^${usernameRegex}$`);

export const publicUserPrefix = 'publicUserLogin';

export const publicUserSeperator = '_';

export const uuidRegex = '[a-f0-9.\\-]{1,36}';

export const userLoginRegex = `^${publicUserPrefix}${publicUserSeperator}${usernameRegex}${publicUserSeperator}${uuidRegex}`;

export const publicUserLoginRegex = new RegExp(`^${userLoginRegex}$`);

export const createNewPublicUserLogin = (publicUserName: string, publicUserId: string) =>
  `${publicUserPrefix}${publicUserSeperator}${publicUserName}${publicUserSeperator}${publicUserId}`;

export const publicUserRegex = new RegExp(`${publicUserNameRegex.source}|${publicUserLoginRegex.source}`);
