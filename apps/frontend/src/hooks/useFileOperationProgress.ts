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

import { useEffect, useState } from 'react';

const useFileOperationProgress = <T>(
  eventSource: EventSource | null,
  types: string[],
  clearIfComplete?: (data: T, setter: (d: T | null) => void) => Promise<void>,
): T | null => {
  const [progress, setProgress] = useState<T | null>(null);

  useEffect(() => {
    if (!eventSource) {
      return () => {};
    }

    const controller = new AbortController();
    const handler = (evt: MessageEvent<string>) => {
      try {
        const data = JSON.parse(evt.data) as T;
        setProgress(data);
        clearIfComplete?.(data, setProgress).catch((err) => console.error('Error in progress handler:', err));
      } catch (err) {
        console.error('Invalid JSON in SSE event', err);
      }
    };

    types.forEach((type) =>
      eventSource.addEventListener(type, handler as EventListener, {
        signal: controller.signal,
      }),
    );

    return () => controller.abort();
  }, [eventSource, types.join(',')]);

  return progress;
};

export default useFileOperationProgress;
