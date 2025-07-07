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

import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const getUsernameFromRequest = (req: Request): string => {
  const request = req as Request & { user?: { preferred_username?: string } };
  if (!request.user?.preferred_username) {
    throw new UnauthorizedException('preferred_username in JWT is missing');
  }
  return request.user.preferred_username;
};

export default getUsernameFromRequest;
