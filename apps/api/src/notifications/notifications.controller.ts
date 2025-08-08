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
  NOTIFICATION_DEVICES_EDU_API_ENDPOINT,
  NOTIFICATIONS_EDU_API_ENDPOINT,
} from '@libs/notification/constants/apiEndpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Patch } from '@nestjs/common';
import UserDeviceDto from '@libs/notification/types/userDevice.dto';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import NotificationsService from './notifications.service';

@ApiTags(NOTIFICATIONS_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(NOTIFICATIONS_EDU_API_ENDPOINT)
class NotificationsController {
  constructor(private readonly pushNotificationService: NotificationsService) {}

  @Patch(NOTIFICATION_DEVICES_EDU_API_ENDPOINT)
  async registerDevice(@GetCurrentUsername() username: string, @Body() dto: UserDeviceDto): Promise<void> {
    await this.pushNotificationService.registerDevice(username, dto);
  }

  @Delete(NOTIFICATION_DEVICES_EDU_API_ENDPOINT)
  async unregisterDevice(@GetCurrentUsername() username: string, @Body() dto: UserDeviceDto): Promise<void> {
    await this.pushNotificationService.unregisterDevice(username, dto);
  }
}

export default NotificationsController;
