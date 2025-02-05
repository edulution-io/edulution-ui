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

import { firstUsername, secondUsername } from './usernames';

export const firstParticipant = {
  username: firstUsername,
  lastName: 'name1',
  firstName: 'pupil1',
  label: 'pupil1-name1',
  value: firstUsername,
};

export const secondParticipant = {
  username: secondUsername,
  lastName: 'name2',
  firstName: 'pupil2',
  label: 'pupil2-name2',
  value: secondUsername,
};

export const mockedParticipants = [firstParticipant, secondParticipant];
