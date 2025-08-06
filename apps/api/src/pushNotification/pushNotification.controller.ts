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
  PUSH_NOTIFICATION_REGISTER_DEVICE_EDU_API_ENDPOINT,
  PUSH_NOTIFICATION_UNREGISTER_DEVICE_EDU_API_ENDPOINT,
} from '@libs/pushNotification/constants/apiEndpoints';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Post } from '@nestjs/common';
import UserDeviceDto from '@libs/pushNotification/types/userDevice.dto';
import PushNotificationService from './pushNotification.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';

@ApiTags(PUSH_NOTIFICATION_EDU_API_ENDPOINT)
@ApiBearerAuth()
@Controller(PUSH_NOTIFICATION_EDU_API_ENDPOINT)
class PushNotificationController {
  constructor(private readonly pushNotificationService: PushNotificationService) {}

  @Post(PUSH_NOTIFICATION_REGISTER_DEVICE_EDU_API_ENDPOINT)
  async registerDevice(@GetCurrentUsername() username: string, @Body() userDeviceDto: UserDeviceDto): Promise<void> {
    await this.pushNotificationService.registerDevice(username, userDeviceDto);
  }

  @Post(PUSH_NOTIFICATION_UNREGISTER_DEVICE_EDU_API_ENDPOINT)
  async unregisterDevice(@GetCurrentUsername() username: string, @Body() userDeviceDto: UserDeviceDto): Promise<void> {
    await this.pushNotificationService.unregisterDevice(username, userDeviceDto);
  }
}

export default PushNotificationController;
