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

import JWTUser from '@libs/user/types/jwt/jwtUser';

interface GetCurrentUserOptions {
  required?: boolean;
}

const GetCurrentUser = createParamDecorator(
  (options: GetCurrentUserOptions | undefined, ctx: ExecutionContext): JWTUser | undefined => {
    const { required = true } = options ?? {};

    const request: Request = ctx.switchToHttp().getRequest();
    if (required && !request.user) {
      throw new UnauthorizedException('JWT is missing');
    }
    return request.user;
  },
);

export default GetCurrentUser;
