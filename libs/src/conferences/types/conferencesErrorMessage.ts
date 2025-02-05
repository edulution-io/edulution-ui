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

enum ConferencesErrorMessage {
  MeetingNotFound = 'conferences.errors.MeetingNotFound',
  CouldNotStartConference = 'conferences.errors.CouldNotStartConference',
  CouldNotStopConference = 'conferences.errors.CouldNotStopConference',
  BbbServerNotReachable = 'conferences.errors.BbbServerNotReachable',
  BbbUnauthorized = 'conferences.errors.BbbUnauthorized',
  AppNotProperlyConfigured = 'conferences.errors.AppNotProperlyConfigured',
  YouAreNotTheCreator = 'conferences.errors.YouAreNotTheCreator',
  DBAccessFailed = 'conferences.errors.DBAccessFailed',
  WrongPassword = 'conferences.errors.WrongPassword',
  ConferenceIsNotRunning = 'conferences.errors.ConferenceIsNotRunning',
  MissingMandatoryParameters = 'conferences.errors.MissingMandatoryParameters',
}

export default ConferencesErrorMessage;
