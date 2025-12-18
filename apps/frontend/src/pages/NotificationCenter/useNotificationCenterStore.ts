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
import eduApi from '@/api/eduApi';
import NOTIFICATION_CENTER_API_ENDPOINTS from '@libs/notification-center/constants/notificationCenterApiEndpoints';
import CreateAnnouncementDto from '@libs/notification-center/types/create-announcement.dto';
import AnnouncementDto from '@libs/notification-center/types/announcementDto';
import handleApiError from '@/utils/handleApiError';
import { RowSelectionState } from '@tanstack/react-table';

interface AnnouncementStore {
  createdAnnouncements: AnnouncementDto[];
  selectedRows: RowSelectionState;
  selectedAnnouncement: AnnouncementDto | null;
  isLoading: boolean;
  isDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
  isDeleteDialogLoading: boolean;
  error: Error | null;

  setIsDialogOpen: (open: boolean) => void;
  setIsDeleteDialogOpen: (open: boolean) => void;
  setSelectedRows: (rows: RowSelectionState) => void;
  setSelectedAnnouncement: (announcement: AnnouncementDto | null) => void;
  fetchCreatedAnnouncements: () => Promise<void>;
  createAnnouncement: (data: CreateAnnouncementDto) => Promise<boolean>;
  deleteAnnouncements: (selectedRows: RowSelectionState) => Promise<boolean>;
}

const useNotificationCenterStore = create<AnnouncementStore>((set, get) => ({
  createdAnnouncements: [],
  selectedRows: {},
  selectedAnnouncement: null,
  isLoading: false,
  isDialogOpen: false,
  isDeleteDialogOpen: false,
  isDeleteDialogLoading: false,
  error: null,

  setIsDialogOpen: (open) => set({ isDialogOpen: open }),
  setIsDeleteDialogOpen: (open) => set({ isDeleteDialogOpen: open }),
  setSelectedRows: (selectedRows) => set({ selectedRows }),
  setSelectedAnnouncement: (announcement) => set({ selectedAnnouncement: announcement }),

  fetchCreatedAnnouncements: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await eduApi.get<AnnouncementDto[]>(NOTIFICATION_CENTER_API_ENDPOINTS.BASE);
      set({ createdAnnouncements: response.data, isLoading: false });
    } catch (error) {
      handleApiError(error, set);
    }
  },

  createAnnouncement: async (data) => {
    set({ isLoading: true });
    try {
      await eduApi.post(NOTIFICATION_CENTER_API_ENDPOINTS.BASE, data);
      set({ isLoading: false, isDialogOpen: false });
      await get().fetchCreatedAnnouncements();
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    }
  },
  deleteAnnouncements: async (selectedRows: RowSelectionState) => {
    const ids = Object.keys(selectedRows).filter((key) => selectedRows[key]);

    try {
      await eduApi.delete(NOTIFICATION_CENTER_API_ENDPOINTS.BASE, {
        data: ids,
      });
      await get().fetchCreatedAnnouncements();
      set({ selectedRows: {}, isDeleteDialogOpen: false });
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    }
  },
}));

export default useNotificationCenterStore;
