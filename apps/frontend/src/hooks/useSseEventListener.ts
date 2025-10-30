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

type UseSseEventListenerOptions = {
  enabled: boolean;
  dependencies?: unknown[];
};

const useSseEventListener = (
  eventType: string | string[],
  handler: (e: MessageEvent) => void,
  options: UseSseEventListenerOptions = { enabled: true },
) => {
  const eventSource = useSseStore((state) => state.eventSource);

  useEffect(() => {
    if (!options.enabled || !eventSource) {
      return undefined;
    }

    const controller = new AbortController();
    const { signal } = controller;
    const eventTypes = Array.isArray(eventType) ? eventType : [eventType];

    eventTypes.forEach((type) => {
      eventSource.addEventListener(type, handler, { signal });
    });

    return () => {
      controller.abort();
    };
  }, [eventSource, options.enabled, ...(options.dependencies || [])]);
};

export default useSseEventListener;
