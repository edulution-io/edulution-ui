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

import JwtUser from '@libs/user/types/jwt/jwtUser';
import { decodeBase64 } from './getBase64String';
import { decodeBase64Api } from './getBase64StringApi';

const getTokenPayload = (token: string): JwtUser => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWT');

  const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');

  const json = typeof window !== 'undefined' ? decodeBase64(base64) : decodeBase64Api(base64);

  return JSON.parse(json) as JwtUser;
};

export default getTokenPayload;
