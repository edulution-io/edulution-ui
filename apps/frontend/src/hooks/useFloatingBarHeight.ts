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
