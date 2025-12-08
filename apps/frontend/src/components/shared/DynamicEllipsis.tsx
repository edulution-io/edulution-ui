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

import React, { useLayoutEffect, useRef, useState } from 'react';

interface DynamicEllipsisProps {
  text: string;
  className?: string;
}

const DynamicEllipsis: React.FC<DynamicEllipsisProps> = ({ text, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const invisibleElementToMeasureRef = useRef<HTMLSpanElement>(null);
  const [truncatedTextToDisplay, setTruncatedTextToDisplay] = useState(text);

  const measureText = (str: string) => {
    if (!invisibleElementToMeasureRef.current) return 0;
    invisibleElementToMeasureRef.current.textContent = str;
    return invisibleElementToMeasureRef.current.getBoundingClientRect().width;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const measurer = invisibleElementToMeasureRef.current;
    if (!container || !measurer) return;

    const computedStyle = getComputedStyle(container);
    Object.assign(measurer.style, {
      font: computedStyle.font,
      letterSpacing: computedStyle.letterSpacing,
      textTransform: computedStyle.textTransform,
    });

    const availableWidth = container.clientWidth;
    if (measureText(text) <= availableWidth) {
      setTruncatedTextToDisplay(text);
      return;
    }

    let left = 0;
    let right = text.length;
    while (left < right) {
      const mid = Math.ceil((left + right) / 2);
      const headCount = Math.ceil(mid / 2);
      const tailCount = mid - headCount;
      const candidate = `${text.slice(0, headCount)}…${text.slice(-tailCount)}`;
      if (measureText(candidate) > availableWidth) {
        right = mid - 1;
      } else {
        left = mid;
      }
    }

    const totalVisible = Math.min(left, text.length);
    const removedCount = text.length - totalVisible;
    if (removedCount <= 2) {
      setTruncatedTextToDisplay(text);
      return;
    }

    const head = Math.ceil(totalVisible / 2);
    const tail = totalVisible - head;
    setTruncatedTextToDisplay(`${text.slice(0, head)}…${text.slice(-tail)}`);
  }, [text, className]);

  return (
    <>
      <span
        ref={invisibleElementToMeasureRef}
        className={`${className} invisible absolute whitespace-nowrap`}
      />
      <div
        ref={containerRef}
        className={`${className} overflow-hidden whitespace-nowrap`}
      >
        {truncatedTextToDisplay}
      </div>
    </>
  );
};

export default DynamicEllipsis;
