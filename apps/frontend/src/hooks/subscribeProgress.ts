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

import { ProgressHandler } from '@libs/filesharing/types/progressHandler';

const subscribeProgress = <T>(eventSource: EventSource, types: string[], handler: ProgressHandler<T>): (() => void) => {
  const controller = new AbortController();

  const listener = (evt: MessageEvent<string>) => {
    const e = evt;
    let data: T;
    try {
      data = JSON.parse(e.data) as T;
    } catch (err) {
      console.error('Invalid JSON in SSE event', err);
      return;
    }

    Promise.resolve(handler(data)).catch((err) => {
      console.error('Error in progress handler:', err);
    });
  };

  types.forEach((type) => {
    eventSource.addEventListener(type, listener as EventListener, { signal: controller.signal });
  });

  return () => {
    controller.abort();
  };
};

export default subscribeProgress;
