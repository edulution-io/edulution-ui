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
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import SSE_EDU_API_ENDPOINTS from '@libs/sse/constants/sseEndpoints';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { SSE_RECONNECT_DELAY_MS } from '@libs/sse/constants/sseConfig';
import useUserStore from './UserStore/useUserStore';

type SseStore = {
  eventSource: EventSource | null;
  reconnectAttempts: number;
  lastPingTime: number | null;
  setEventSource: () => void;
  reconnect: () => void;
  reset: () => void;
};

const initialValues = {
  eventSource: null,
  reconnectAttempts: 0,
  lastPingTime: null,
};

const useSseStore = create<SseStore>((set, get) => {
  const createEventSource = (token: string): EventSource => {
    const eventSource = new EventSource(`/${EDU_API_ROOT}/${SSE_EDU_API_ENDPOINTS.SSE}?token=${token}`);

    eventSource.addEventListener('error', () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        const state = get();
        setTimeout(
          () => {
            state.reconnect();
          },
          SSE_RECONNECT_DELAY_MS * (state.reconnectAttempts + 1),
        );
      }
    });

    eventSource.addEventListener(SSE_MESSAGE_TYPE.PING, () => {
      set({ lastPingTime: Date.now(), reconnectAttempts: 0 });
    });

    return eventSource;
  };

  const closeExistingSource = () => {
    const existing = get().eventSource;
    if (existing) {
      existing.close();
    }
  };

  return {
    ...initialValues,

    setEventSource: () => {
      const { eduApiToken } = useUserStore.getState();
      if (!eduApiToken) return;

      closeExistingSource();
      set({ reconnectAttempts: 0 });
      const newEventSource = createEventSource(eduApiToken);
      set({ eventSource: newEventSource, lastPingTime: Date.now() });
    },
    reconnect: () => {
      const { eduApiToken } = useUserStore.getState();
      const { reconnectAttempts } = get();
      if (!eduApiToken) return;

      closeExistingSource();
      set({ reconnectAttempts: reconnectAttempts + 1 });
      const newEventSource = createEventSource(eduApiToken);
      set({ eventSource: newEventSource, lastPingTime: Date.now() });
    },
    reset: () => {
      closeExistingSource();
      set(initialValues);
    },
  };
});

export default useSseStore;
