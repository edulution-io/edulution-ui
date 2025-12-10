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
import handleApiError from '@/utils/handleApiError';
import NotificationSettings from '@libs/notification/types/notificationSettings';
import { EDU_API_USERS_ENDPOINT } from '@libs/user/constants/usersApiEndpoints';
import { NOTIFICATION_SETTINGS_EDU_API_ENDPOINT } from '@libs/notification/constants/apiEndpoints';
import useUserStore from '@/store/UserStore/useUserStore';
import { toast } from 'sonner';
import i18n from '@/i18n';

interface NotificationSettingsStore {
  isLoading: boolean;
  error: Error | null;
  notificationSettings: NotificationSettings | null;
  getNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (settings: NotificationSettings) => Promise<boolean>;
  reset: () => void;
}

const initialState = {
  isLoading: false,
  error: null,
  notificationSettings: null,
};

const useNotificationSettingsStore = create<NotificationSettingsStore>((set) => ({
  ...initialState,

  getNotificationSettings: async () => {
    set({ error: null, isLoading: true });
    try {
      const { user } = useUserStore.getState();
      if (!user?.username) return;

      const response = await eduApi.get<NotificationSettings>(
        `${EDU_API_USERS_ENDPOINT}/${user.username}/${NOTIFICATION_SETTINGS_EDU_API_ENDPOINT}`,
      );

      set({ notificationSettings: response.data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  updateNotificationSettings: async (settings: NotificationSettings) => {
    set({ error: null, isLoading: true });
    try {
      const { user } = useUserStore.getState();
      if (!user?.username) return false;

      const response = await eduApi.patch<NotificationSettings>(
        `${EDU_API_USERS_ENDPOINT}/${user.username}/${NOTIFICATION_SETTINGS_EDU_API_ENDPOINT}`,
        settings,
      );

      set({ notificationSettings: response.data });
      toast.success(i18n.t('usersettings.notifications.savedSuccessfully'));
      return true;
    } catch (error) {
      handleApiError(error, set);
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ ...initialState }),
}));

export default useNotificationSettingsStore;
