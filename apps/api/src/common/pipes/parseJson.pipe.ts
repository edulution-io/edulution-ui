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

import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
// @eslint-ignore-next-line @typescript-eslint/class-methods-use-this
class ParseJsonPipe<T = unknown> implements PipeTransform<string, T> {
  transform(value: string): T {
    try {
      return JSON.parse(value) as T;
    } catch {
      throw new BadRequestException('Invalid JSON in dto field');
    }
  }
}

export default ParseJsonPipe;
