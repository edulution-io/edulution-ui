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

import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

const GetCurrentUserGroups = createParamDecorator((_data: unknown, ctx: ExecutionContext): string[] => {
  const request: Request = ctx.switchToHttp().getRequest();
  if (!request.user?.ldapGroups) {
    throw new UnauthorizedException('ldapGroups in JWT is missing');
  }
  return request.user.ldapGroups;
});

export default GetCurrentUserGroups;
