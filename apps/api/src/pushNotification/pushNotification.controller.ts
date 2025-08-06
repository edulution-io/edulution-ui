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

import {
  PUSH_NOTIFICATION_EDU_API_ENDPOINT,
  PUSH_NOTIFICATION_SEND_EDU_API_ENDPOINT,
} from '@libs/pushNotification/constants/apiEndpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import SendPushNotificationDto from '@libs/pushNotification/types/send-pushNotification.dto';
import PushNotificationService from './pushNotification.service';

@ApiTags(PUSH_NOTIFICATION_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(PUSH_NOTIFICATION_EDU_API_ENDPOINT)
class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post(PUSH_NOTIFICATION_SEND_EDU_API_ENDPOINT)
  async sendPushNotification(@Body() sendPushNotificationDto: SendPushNotificationDto): Promise<void> {
    await this.pushNotificationService.sendPushNotification(sendPushNotificationDto);
  }
}

export default PushNotificationController;
