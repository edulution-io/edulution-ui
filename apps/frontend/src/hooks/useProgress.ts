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
import subscribeProgress from '@/hooks/subscribeProgress';

const useProgress = <T>(
  eventSource: EventSource | null,
  types: string[],
  clearIfComplete?: (data: T, setter: (d: T | null) => void) => Promise<void>,
): T | null => {
  const [progress, setProgress] = useState<T | null>(null);

  useEffect(() => {
    if (!eventSource) {
      return undefined;
    }

    return subscribeProgress<T>(eventSource, types, async (data) => {
      setProgress(data);
      if (clearIfComplete) {
        await clearIfComplete(data, setProgress);
      }
    });
  }, [eventSource, types.join(',')]);

  return progress;
};

export default useProgress;
