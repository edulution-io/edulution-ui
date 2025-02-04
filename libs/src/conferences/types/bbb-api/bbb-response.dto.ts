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
import BbbAttendeeDto from './bbb-attendee.dto';

export default class BbbResponseDto {
  response: {
    returncode: string;

    meetingName: string;

    meetingID: string;

    internalMeetingID: string;

    createTime: string;

    createDate: string;

    voiceBridge: string;

    dialNumber: string;

    attendeePW: string;

    moderatorPW: string;

    metadata: Record<string, string>;

    attendees: { attendee: BbbAttendeeDto | BbbAttendeeDto[] };

    // The parameters below are all number strings: "0" or "123141"
    duration: string;

    startTime: string;

    endTime: string;

    participantCount: string;

    listenerCount: string;

    voiceParticipantCount: string;

    videoCount: string;

    maxUsers: string;

    moderatorCount: string;

    // The parameters below are all boolean strings: "true" or "false"
    running: string;

    recording: string;

    hasBeenForciblyEnded: string;

    hasUserJoined: string;

    isBreakout: string;
  };
}
