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
