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
