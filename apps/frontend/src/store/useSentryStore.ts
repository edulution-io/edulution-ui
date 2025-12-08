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

import { create, StateCreator } from 'zustand';
import type SentryConfig from '@libs/common/types/sentryConfig';
import eduApi from '@/api/eduApi';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface UseSentryStore {
  initialized: boolean;
  config: SentryConfig | null;
  init: (config: SentryConfig) => Promise<void>;
  fetchAndInitSentry: () => Promise<void>;
  clear: () => void;
}

type PersistedSentryStore = (
  sentryConfig: StateCreator<UseSentryStore>,
  options: PersistOptions<Partial<UseSentryStore>>,
) => StateCreator<UseSentryStore>;

const useSentryStore = create<UseSentryStore>(
  (persist as PersistedSentryStore)(
    (set, get) => ({
      initialized: false,
      config: null,

      init: async (config) => {
        if (get().initialized || !config?.dsn) return;

        const { init, setTag } = await import('@sentry/react');

        const tenant = window.location.hostname;
        init({
          dsn: config.dsn,
          environment: tenant,
          sendDefaultPii: true,
          tracesSampleRate: 1.0,
          release: `edulution-ui@${APP_VERSION}`,
        });

        setTag('tenant', tenant);

        console.info(`[Sentry] initialized for ${tenant}`);

        set({ initialized: true, config });
      },

      fetchAndInitSentry: async () => {
        try {
          const { data } = await eduApi.get<SentryConfig>('global-settings/sentry');
          set({ config: data });
          await get().init(data);
        } catch (e) {
          console.warn('[Sentry] fetch failed', e);
        }
      },

      clear: () => {
        set({ initialized: false, config: null });
      },
    }),
    {
      name: 'sentryConfig',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ config: state.config }),
    },
  ),
);

export default useSentryStore;
