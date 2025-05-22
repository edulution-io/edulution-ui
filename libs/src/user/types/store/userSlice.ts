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

import AttendeeDto from '@libs/user/types/attendee.dto';
import UserLanguageType from '@libs/user/types/userLanguageType';
import Keycloak from 'keycloak-js';
import UserDto from '../user.dto';

type UserSlice = {
  isAuthenticated: boolean;
  user: UserDto | null;
  getUser: (username: string) => Promise<void>;
  createOrUpdateUser: (user: UserDto) => Promise<UserDto | undefined>;
  updateUserLanguage: (language: UserLanguageType) => Promise<void>;
  updateUser: (user: Partial<UserDto>) => Promise<void>;
  eduApiToken: string;
  setEduApiToken: (eduApiToken: string) => void;
  getWebdavKey: () => Promise<string>;
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
  userIsLoading: boolean;
  userError: Error | null;
  searchAttendees: (searchQuery: string) => Promise<AttendeeDto[]>;
  searchError: Error | null;
  searchIsLoading: boolean;
  resetUserSlice: () => void;
  keycloak: Keycloak;
};

export default UserSlice;
