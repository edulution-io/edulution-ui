/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import AttendeeDto from '@libs/user/types/attendee.dto';
import UserLanguageType from '@libs/user/types/userLanguageType';
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
  isPreparingLogout: boolean;
  logout: () => Promise<void>;
  userIsLoading: boolean;
  userError: Error | null;
  searchAttendees: (searchQuery: string) => Promise<AttendeeDto[]>;
  searchError: Error | null;
  searchIsLoading: boolean;
  resetUserSlice: () => void;
};

export default UserSlice;
