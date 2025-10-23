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

import { create } from 'zustand';

interface MenuBarStore {
  isMobileMenuBarOpen: boolean;
  toggleMobileMenuBar: () => void;
  closeMobileMenuBar: () => void;
  reset: () => void;
}

const initialValues = {
  isMobileMenuBarOpen: false,
};

const useMenuBarStore = create<MenuBarStore>((set) => ({
  ...initialValues,
  reset: () => set(initialValues),
  toggleMobileMenuBar: () => set((state) => ({ isMobileMenuBarOpen: !state.isMobileMenuBarOpen })),
  closeMobileMenuBar: () => set({ isMobileMenuBarOpen: false }),
}));

export default useMenuBarStore;
