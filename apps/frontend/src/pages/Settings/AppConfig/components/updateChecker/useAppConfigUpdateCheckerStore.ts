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
import SogoThemeVersionDto from '@libs/mail/types/sogo-theme-version.dto';
import { toast } from 'sonner';
import i18n from '@/i18n';

type AppConfigUpdateCheckerStore = {
  isLoading: boolean;
  isUpdating: boolean;
  versionInfo: SogoThemeVersionDto | null;
  error: Error | null;
  checkVersion: (baseEndpoint: string, path: string, silent?: boolean) => Promise<void>;
  triggerUpdate: (baseEndpoint: string, path: string) => Promise<void>;
  reset: () => void;
};

const initialState = {
  isLoading: false,
  isUpdating: false,
  versionInfo: null,
  error: null,
};

const useAppConfigUpdateCheckerStore = create<AppConfigUpdateCheckerStore>((set) => ({
  ...initialState,

  checkVersion: async (baseEndpoint: string, path: string, silent?: boolean) => {
    if (!baseEndpoint || !path) return;

    set({ isLoading: true, error: null });
    try {
      const { data } = await eduApi.get<SogoThemeVersionDto>(`${baseEndpoint}/${path}`);

      set({ versionInfo: data });

      if (!silent) {
        toast.success(i18n.t('appExtendedOptions.updateChecker.checkVersionSuccess'));
      }
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isLoading: false });
    }
  },

  triggerUpdate: async (baseEndpoint: string, path: string) => {
    if (!baseEndpoint || !path) return;

    set({ isUpdating: true, error: null });
    try {
      await eduApi.post(`${baseEndpoint}/${path}/update`);

      const { data } = await eduApi.get<SogoThemeVersionDto>(`${baseEndpoint}/${path}`);

      set({ versionInfo: data });
    } catch (error) {
      handleApiError(error, set);
    } finally {
      set({ isUpdating: false });
    }
  },

  reset: () => set(initialState),
}));

export default useAppConfigUpdateCheckerStore;
