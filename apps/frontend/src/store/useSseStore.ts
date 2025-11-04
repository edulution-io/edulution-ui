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

import { create } from 'zustand';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import SSE_EDU_API_ENDPOINTS from '@libs/sse/constants/sseEndpoints';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { SSE_RECONNECT_DELAY_MS } from '@libs/sse/constants/sseConfig';

type SseStore = {
  eventSource: EventSource | null;
  currentToken: string | null;
  reconnectAttempts: number;
  lastPingTime: number | null;
  setEventSource: (eduApiToken: string) => void;
  reconnect: () => void;
  reset: () => void;
};

const initialValues = {
  eventSource: null,
  currentToken: null,
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

    setEventSource: (eduApiToken) => {
      closeExistingSource();
      set({ currentToken: eduApiToken, reconnectAttempts: 0 });
      const newEventSource = createEventSource(eduApiToken);
      set({ eventSource: newEventSource, lastPingTime: Date.now() });
    },
    reconnect: () => {
      const { currentToken, reconnectAttempts } = get();
      if (!currentToken) return;

      closeExistingSource();
      set({ reconnectAttempts: reconnectAttempts + 1 });
      const newEventSource = createEventSource(currentToken);
      set({ eventSource: newEventSource, lastPingTime: Date.now() });
    },
    reset: () => {
      closeExistingSource();
      set(initialValues);
    },
  };
});

export default useSseStore;
