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

import { RefObject, useLayoutEffect } from 'react';
import { DECREASE_DELAY_MS } from '@libs/ui/constants/floatingButtonsConfig';

const useFloatingBarHeight = (barRef: RefObject<HTMLDivElement>) => {
  useLayoutEffect(() => {
    if (!barRef.current || typeof ResizeObserver === 'undefined') return undefined;
    const el = barRef.current;

    let lastHeight = el.clientHeight;
    let decreaseTimer: number | undefined;

    const apply = () => {
      const newHeight = el.clientHeight;

      if (decreaseTimer) {
        clearTimeout(decreaseTimer);
        decreaseTimer = undefined;
      }

      if (newHeight >= lastHeight) {
        document.documentElement.style.setProperty('--floating-bar-h', `${newHeight}px`);
        lastHeight = newHeight;
      } else {
        decreaseTimer = window.setTimeout(() => {
          document.documentElement.style.setProperty('--floating-bar-h', `${newHeight}px`);
          lastHeight = newHeight;
        }, DECREASE_DELAY_MS);
      }
    };

    apply();

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    window.addEventListener('resize', apply);

    return () => {
      if (decreaseTimer) {
        clearTimeout(decreaseTimer);
      }
      ro.disconnect();
      window.removeEventListener('resize', apply);
    };
  }, [barRef]);
};

export default useFloatingBarHeight;
