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
  insetPixel?: number;
}

const useTrulyVisible = (
  ref: RefObject<HTMLElement>,
  deps: unknown[] = [],
  options: UseTrulyVisibleOptions = {},
): boolean => {
  const { insetPixel = 2 } = options;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setIsVisible(false);
      return;
    }

    const check = () => {
      const { left, top, right, bottom } = el.getBoundingClientRect();

      const inViewport =
        Math.ceil(top) >= 0 &&
        Math.ceil(left) >= 0 &&
        Math.floor(bottom) <= window.innerHeight &&
        Math.floor(right) <= window.innerWidth;

      if (!inViewport) {
        setIsVisible(false);
        return;
      }

      const x1f = left + insetPixel;
      const y1f = top + insetPixel;
      const x2f = right - insetPixel;
      const y2f = bottom - insetPixel;
      const cxf = (x1f + x2f) / 2;
      const cyf = (y1f + y2f) / 2;

      const points: [number, number][] = [
        [Math.floor(x1f), Math.floor(y1f)],
        [Math.ceil(x2f), Math.floor(y1f)],
        [Math.floor(x1f), Math.ceil(y2f)],
        [Math.ceil(x2f), Math.ceil(y2f)],
        [Math.round(cxf), Math.round(cyf)],
      ];

      const fullyUnoccluded = points.every(([x, y]) => {
        const topEl = document.elementFromPoint(x, y);
        return Boolean(topEl) && el.contains(topEl);
      });

      setIsVisible(fullyUnoccluded);
    };

    check();

    const raf = window.requestAnimationFrame(check);

    window.addEventListener('scroll', check, true);
    window.addEventListener('resize', check);

    // eslint-disable-next-line consistent-return
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('scroll', check, true);
      window.removeEventListener('resize', check);
    };
  }, [ref, insetPixel, ...deps]);

  return isVisible;
};

export default useTrulyVisible;
