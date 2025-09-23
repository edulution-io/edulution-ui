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

interface UseOpenFileDialogStore {
  setOpenFileDialog: (open: boolean) => void;
  isFileDialogOpen: boolean;
  allowedExtensions: string[];
  setAllowedExtensions: (extension: string[]) => void;
  reset: () => void;
}

const initialState = {
  allowedExtensions: [],
  openFileDialogOpen: false,
  isFileDialogOpen: false,
};

const useOpenFileDialogStore = create<UseOpenFileDialogStore>((set) => ({
  ...initialState,
  setOpenFileDialog: (open) => set({ isFileDialogOpen: open }),
  setAllowedExtensions: (exts) => set({ allowedExtensions: exts }),
  reset: () => set({ ...initialState }),
}));

export default useOpenFileDialogStore;
