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

// This DTO is based on a third-party object definition from expo-push-notification https://docs.expo.dev/push-notifications/sending-notifications/#formats.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import { PushNotificationPriority } from '@libs/pushNotification/constants/pushNotificationPriority';
import { PushNotificationInterruptionLevel } from '@libs/pushNotification/constants/pushNotificationInterruptionLevel';

class SendPushNotificationDto {
  to: string | string[];

  contentAvailable?: boolean;

  data?: Record<string, unknown>;

  title?: string;

  body?: string;

  ttl?: number;

  expiration?: number;

  priority?: PushNotificationPriority;

  subtitle?: string;

  sound?: string | null;

  badge?: number;

  interruptionLevel?: PushNotificationInterruptionLevel;

  channelId?: string;

  icon?: string;

  richContent?: { image: string };

  categoryId?: string;

  mutableContent?: boolean;

  accessToken?: string;
}

export default SendPushNotificationDto;
