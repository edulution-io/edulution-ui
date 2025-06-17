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
      const candidate = `${text.slice(0, headCount)  }…${  text.slice(-tailCount)}`;
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
    setTruncatedTextToDisplay(`${text.slice(0, head)  }…${  text.slice(-tail)}`);
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
