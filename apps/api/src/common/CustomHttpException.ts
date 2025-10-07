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

import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import ErrorMessage from '@libs/error/errorMessage';

class CustomHttpException extends HttpException {
  constructor(errorMessage: ErrorMessage, status: HttpStatus, data?: unknown, domain?: string) {
    super(errorMessage, status);
    CustomHttpException.logError(errorMessage, status, data, domain);
  }

  private static logError(errorMessage: ErrorMessage, status: HttpStatus, data?: unknown, domain?: string) {
    const domainFallback = errorMessage.slice(0, errorMessage.indexOf('.'));
    const error = errorMessage.slice(errorMessage.lastIndexOf('.') + 1, errorMessage.length);
    const message = `HttpStatus: ${status}, Error: ${error}${data ? `, Data: ${JSON.stringify(data)}` : ''}`;
    const context = domain ?? domainFallback;

    if (status < HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production') {
      Logger.debug(message, context);
    } else {
      Logger.warn(message, context);
    }
  }
}

export default CustomHttpException;
