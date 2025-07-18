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

import { Controller, Res, Sse, MessageEvent, Query, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { Response } from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import APPS from '@libs/appconfig/constants/apps';
import SSE_EDU_API_ENDPOINTS from '@libs/sse/constants/sseEndpoints';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import CustomHttpException from '../common/CustomHttpException';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import SseService from './sse.service';
import { Public } from '../common/decorators/public.decorator';
import { Conference, ConferenceDocument } from '../conferences/conference.schema';

@ApiTags(SSE_EDU_API_ENDPOINTS.SSE)
@ApiBearerAuth()
@Controller(SSE_EDU_API_ENDPOINTS.SSE)
class SseController {
  constructor(
    private readonly sseService: SseService,
    @InjectModel(Conference.name) private conferenceModel: Model<ConferenceDocument>,
  ) {}

  @Sse()
  public getSseConnection(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return this.sseService.subscribe(username, res);
  }

  @Public()
  @Sse(`${APPS.CONFERENCES}/public`)
  async publicConferenceSse(
    @Query('meetingID') meetingID: string,
    @Res() res: Response,
  ): Promise<Observable<MessageEvent | null>> {
    const exists = await this.conferenceModel.exists({ meetingID, isPublic: true });
    if (exists) {
      return this.sseService.subscribe(meetingID, res);
    }
    throw new CustomHttpException(
      ConferencesErrorMessage.MeetingNotFound,
      HttpStatus.NOT_FOUND,
      { meetingID },
      SseController.name,
    );
  }

  @Public()
  @Sse(AUTH_PATHS.AUTH_ENDPOINT)
  publicLoginSse(@Query('sessionId') sessionId: string, @Res() res: Response): Observable<MessageEvent | null> {
    return this.sseService.subscribe(sessionId, res);
  }
}

export default SseController;
