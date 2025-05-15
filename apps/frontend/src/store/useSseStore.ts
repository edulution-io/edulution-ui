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

type SseStore = {
  eventSource: EventSource | null;
  setEventSource: (eduApiToken: string) => void;
  reset: () => void;
};

const useSseStore = create<SseStore>((set, get) => ({
  eventSource: null,
  setEventSource: (eduApiToken) =>
    set({
      eventSource: new EventSource(`/${EDU_API_ROOT}/${SSE_EDU_API_ENDPOINTS.SSE}?token=${eduApiToken}`),
    }),
  reset: () => {
    get().eventSource?.close();
    set({ eventSource: null });
  },
}));

export default useSseStore;
