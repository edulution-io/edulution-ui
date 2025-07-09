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

import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import AuthErrorMessages from '@libs/auth/constants/authErrorMessages';
import CustomHttpException from '../CustomHttpException';

@Injectable()
class LocalhostGuard implements CanActivate {
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip || request.socket.remoteAddress;

    if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
      return true;
    }

    throw new CustomHttpException(
      AuthErrorMessages.Unauthorized,
      HttpStatus.UNAUTHORIZED,
      undefined,
      LocalhostGuard.name,
    );
  }
}

export default LocalhostGuard;
