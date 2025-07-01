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

import { parse } from 'cookie';
import { Request } from 'express';
import COOKIE_DESCRIPTORS from '@libs/common/constants/cookieDescriptors';

const extractToken = (request: Request): string => {
  const tokenFromQuery = request.query.token as string;
  if (tokenFromQuery) {
    return tokenFromQuery;
  }

  const authHeader = request.headers.authorization;
  if (authHeader) {
    const [type, token] = authHeader.split(' ');
    if (type === 'Bearer' && token) {
      return token;
    }
  }

  const cookies = parse(request.headers.cookie || '');
  return cookies[COOKIE_DESCRIPTORS.AUTH_TOKEN] || '';
};

export default extractToken;
