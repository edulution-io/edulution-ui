import { create } from 'zustand';
import AllowedSenderDto from '@libs/notification-center/types/allowedSenderDto';
import AllowedAnnouncementSenderTableStore from '@libs/appconfig/types/allowedAnnouncementSenderTableStore';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import AppConfigDto from '@libs/appconfig/types/appConfigDto';
import eduApi from '@/api/eduApi';
import NOTIFICATION_CENTER_API_ENDPOINTS from '@libs/notification-center/constants/notificationCenterApiEndpoints';
import handleApiError from '@/utils/handleApiError';

const useAllowedSenderTableStore = create<AllowedAnnouncementSenderTableStore>((set, get) => ({
  tableContentData: [],
  selectedRows: {},
  canCreate: false,
  isCanCreateLoading: false,

  fetchTableContent: async () => {
    try {
      const { appConfigs, getAppConfigs } = useAppConfigsStore.getState();

      if (!appConfigs.find((c) => c.name === APPS.NOTIFICATION_CENTER)) {
        await getAppConfigs();
      }

      const notificationCenterConfig = appConfigs.find((c) => c.name === APPS.NOTIFICATION_CENTER);
      const allowedSenders =
        notificationCenterConfig?.extendedOptions?.[ExtendedOptionKeys.NOTIFICATION_CENTER_ALLOWED_CREATORS];

      if (Array.isArray(allowedSenders)) {
        set({ tableContentData: allowedSenders as AllowedSenderDto[] });
      } else {
        set({ tableContentData: [] });
      }
    } catch (error) {
      handleApiError(error, set);
      set({ tableContentData: [] });
    }
  },

  setTableContentData: async (data) => {
    set({ tableContentData: data });

    try {
      const { appConfigs, updateAppConfig } = useAppConfigsStore.getState();
      const notificationCenterConfig = appConfigs.find((c) => c.name === APPS.NOTIFICATION_CENTER);

      if (notificationCenterConfig) {
        const updatedConfig = {
          ...notificationCenterConfig,
          extendedOptions: {
            ...notificationCenterConfig.extendedOptions,
            [ExtendedOptionKeys.NOTIFICATION_CENTER_ALLOWED_CREATORS]: data,
          },
        } as AppConfigDto;

        await updateAppConfig(updatedConfig);
      }
    } catch (error) {
      handleApiError(error, set);
    }
  },

  setSelectedRows: (selectedRows) => set({ selectedRows }),

  deleteTableEntry: async (_appName: string, id: string) => {
    const { tableContentData } = get();
    const filteredData = tableContentData.filter((entry) => entry.allowedSenderId !== id);

    set({ tableContentData: filteredData });

    try {
      const { appConfigs, updateAppConfig } = useAppConfigsStore.getState();
      const notificationCenterConfig = appConfigs.find((c) => c.name === APPS.NOTIFICATION_CENTER);

      if (notificationCenterConfig) {
        const updatedConfig = {
          ...notificationCenterConfig,
          extendedOptions: {
            ...notificationCenterConfig.extendedOptions,
            [ExtendedOptionKeys.NOTIFICATION_CENTER_ALLOWED_CREATORS]: filteredData,
          },
        } as AppConfigDto;

        await updateAppConfig(updatedConfig);
      }
    } catch (error) {
      handleApiError(error, set);
    }
  },

  fetchCanCreate: async () => {
    set({ isCanCreateLoading: true });
    try {
      const response = await eduApi.get<boolean>(
        `${NOTIFICATION_CENTER_API_ENDPOINTS.BASE}/${NOTIFICATION_CENTER_API_ENDPOINTS.CAN_CREATE}`,
      );
      set({ canCreate: response.data });
    } catch (error) {
      handleApiError(error, set);
      set({ canCreate: false });
    } finally {
      set({ isCanCreateLoading: false });
    }
  },
}));

export default useAllowedSenderTableStore;
