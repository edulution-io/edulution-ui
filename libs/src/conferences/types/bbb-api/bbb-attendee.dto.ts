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

// This DTO is based on a third-party object definition from the BBB (BigBlueButton) API.
// Any modifications should be carefully reviewed to ensure compatibility with the source.

import ConferenceRole from '@libs/conferences/types/conference-role.enum';

export default class BbbAttendeeDto {
  userID: string;

  fullName: string;

  role: ConferenceRole;

  clientType: string;

  // The parameters below are all boolean strings: "true" or "false"
  isPresenter: string;

  isListeningOnly: string;

  hasJoinedVoice: string;

  hasVideo: string;
}
