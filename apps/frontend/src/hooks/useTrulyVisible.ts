/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
