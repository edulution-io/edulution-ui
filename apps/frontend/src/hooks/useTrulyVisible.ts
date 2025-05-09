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

import { RefObject, useEffect, useState } from 'react';

interface UseTrulyVisibleOptions {
  ignoreRight?: boolean;
  itemName?: string;
}

const useTrulyVisible = (
  ref: RefObject<HTMLElement>,
  deps: unknown[] = [],
  options: UseTrulyVisibleOptions = {},
): boolean => {
  const { ignoreRight = false, itemName } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setIsVisible(false);
      return;
    }

    const check = () => {
      const rect = el.getBoundingClientRect();

      const topInView = rect.top >= 0;
      const leftInView = rect.left >= 0;
      const bottomInView = rect.bottom <= window.innerHeight;
      const rightInView = ignoreRight || rect.right <= window.innerWidth;

      if (!topInView || !leftInView || !bottomInView || !rightInView)
        console.log(
          `({ topInView, leftInView, bottomInView, rightInView }) ${JSON.stringify(
            {
              itemName,
              topInView,
              leftInView,
              bottomInView,
              rightInView,
            },
            null,
            2,
          )}`,
        );

      const inViewport = topInView && leftInView && bottomInView && rightInView;

      if (!inViewport) {
        setIsVisible(false);
        return;
      }

      const points = [
        [rect.left + 1, rect.top + 1],
        [rect.right - 1, rect.top + 1],
        [rect.left + 1, rect.bottom - 1],
        [rect.right - 1, rect.bottom - 1],
        [(rect.left + rect.right) / 2, (rect.top + rect.bottom) / 2],
      ] as [number, number][];

      const fullyUnoccluded = points.every(([x, y]) => {
        const topEl = document.elementFromPoint(x, y);
        return el.contains(topEl);
      });

      if (!fullyUnoccluded) console.log(`fullyUnoccluded ${JSON.stringify(fullyUnoccluded, null, 2)}`);

      setIsVisible(fullyUnoccluded);
    };

    check();
    window.addEventListener('scroll', check, true);
    window.addEventListener('resize', check);

    // eslint-disable-next-line consistent-return
    return () => {
      window.removeEventListener('scroll', check, true);
      window.removeEventListener('resize', check);
    };
  }, [ref, ...deps]);

  return isVisible;
};

export default useTrulyVisible;
