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

import { useEffect } from 'react';
import useSseStore from '@/store/useSseStore';
import { SSE_PING_TIMEOUT_MS } from '@libs/sse/constants/sseConfig';

const useSseHeartbeatMonitor = () => {
  const eventSource = useSseStore((state) => state.eventSource);

  useEffect(() => {
    if (!eventSource) {
      return undefined;
    }

    const interval = setInterval(() => {
      const state = useSseStore.getState();
      if (state.lastPingTime && Date.now() - state.lastPingTime > SSE_PING_TIMEOUT_MS) {
        state.reconnect();
      }
    }, SSE_PING_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
    };
  }, [eventSource]);
};

export default useSseHeartbeatMonitor;
