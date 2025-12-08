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
