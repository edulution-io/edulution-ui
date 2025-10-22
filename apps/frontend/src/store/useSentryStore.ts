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

import * as Sentry from '@sentry/react';
import { create, StateCreator } from 'zustand';
import type SentryConfig from '@libs/common/types/sentryConfig';
import eduApi from '@/api/eduApi';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

interface UseSentryStore {
  initialized: boolean;
  config: SentryConfig | null;
  init: (config: SentryConfig) => void;
  fetchAndInit: () => Promise<void>;
  setUser: (user: { id?: string; username?: string; email?: string }) => void;
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

      init: (config) => {
        if (get().initialized || !config?.dsn) return;

        const tenant = window.location.hostname;
        Sentry.init({
          dsn: config.dsn,
          environment: tenant,
          sendDefaultPii: true,
          tracesSampleRate: 1.0,
        });

        Sentry.setTag('tenant', tenant);

        console.info(`[Sentry] initialized for ${tenant}`);

        set({ initialized: true, config });
      },

      fetchAndInit: async () => {
        try {
          const { data } = await eduApi.get<SentryConfig>('global-settings/sentry');
          set({ config: data });
          get().init(data);
        } catch (err) {
          console.warn('[Sentry] fetch failed', err);
        }
      },

      setUser: (user) => {
        Sentry.setUser(user);
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
