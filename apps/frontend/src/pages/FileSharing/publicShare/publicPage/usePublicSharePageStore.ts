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

interface UsePublicSharePageStore {
  isPublicShareInfoDialogOpen: boolean;
  publicShareId: string | null;
  setOpenPublicShareDialog: (id: string) => void;
  setPublicShareId: (id: string) => void;
  closePublicShareDialog: () => void;
  reset: () => void;
}

const initialState = {
  isPublicShareInfoDialogOpen: false,
  publicShareId: null,
};

const usePublicSharePageStore = create<UsePublicSharePageStore>((set) => ({
  ...initialState,
  setOpenPublicShareDialog: (id) => set({ isPublicShareInfoDialogOpen: true, publicShareId: id }),
  closePublicShareDialog: () => set({ isPublicShareInfoDialogOpen: false, publicShareId: null }),
  setPublicShareId: (id) => set({ publicShareId: id }),
  reset: () => set({ ...initialState }),
}));

export default usePublicSharePageStore;
