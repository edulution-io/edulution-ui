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

import LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';

interface LmnApiStoreState {
  isLoading: boolean;
  error: Error | null;
  currentUser: LmnUserInfo | null;
}

interface LmnApiStoreActions {
  reset: () => void;
  setCurrentUser: (user: LmnUserInfo | null) => void;
  setFirstPassword: (username: string, password: string) => Promise<void>;
  setCurrentPassword: (username: string, password: string) => Promise<void>;
}

type LmnApiStore = LmnApiStoreState & LmnApiStoreActions;

export default LmnApiStore;
