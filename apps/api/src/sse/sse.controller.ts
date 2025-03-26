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

import { Controller, Res, Sse, MessageEvent } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Response } from 'express';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import SseService from './sse.service';
// import { Public } from '../common/decorators/public.decorator';

@ApiTags('sse')
@ApiBearerAuth()
@Controller('sse')
class SseController {
  constructor(private readonly sseService: SseService) {}

  @Sse()
  public getSseConnection(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return this.sseService.subscribe(username, res);
  }

  // @Public()
  // @Sse('sse/public')
  // publicSse(@Query('meetingID') meetingID: string, @Res() res: Response): Observable<MessageEvent> {
  //   return this.conferencesService.subscribe(meetingID, res);
  // }
}

export default SseController;
