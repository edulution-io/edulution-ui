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

import React from 'react';
import { cn } from '@edulution-io/ui-kit';
import parseTimeToMinutes from '@libs/common/utils/parseTimeToMinutes';

interface WeeklyScheduleCalendarBlockProps {
  blockId: string;
  day: number;
  label: string;
  color: string;
  startTime: string;
  endTime: string;
  pixelsPerHour: number;
  visibleStartHour: number;
  columnCount: number;
  columnIndex: number;
  readOnly: boolean;
  onDragStart: (blockId: string, day: number, edge: 'top' | 'bottom', e: React.PointerEvent) => void;
  onClick?: (blockId: string, day: number, e: React.MouseEvent) => void;
}

const WeeklyScheduleCalendarBlock = ({
  blockId,
  day,
  label,
  color,
  startTime,
  endTime,
  pixelsPerHour,
  visibleStartHour,
  columnCount,
  columnIndex,
  readOnly,
  onDragStart,
  onClick,
}: WeeklyScheduleCalendarBlockProps) => {
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);
  const visibleStartMinutes = visibleStartHour * 60;

  const top = ((startMinutes - visibleStartMinutes) / 60) * pixelsPerHour;
  const height = ((endMinutes - startMinutes) / 60) * pixelsPerHour;

  const widthPercent = 100 / columnCount;
  const leftPercent = columnIndex * widthPercent;

  return (
    <div
      role="button"
      tabIndex={0}
      className="absolute cursor-pointer select-none overflow-hidden rounded-sm"
      style={{
        top,
        height: Math.max(height, 4),
        left: `${leftPercent}%`,
        width: `calc(${widthPercent}% - 2px)`,
        backgroundColor: `${color}20`,
        borderLeft: `3px solid ${color}`,
      }}
      onClick={(e) => onClick?.(blockId, day, e)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(blockId, day, e as unknown as React.MouseEvent);
        }
      }}
    >
      {!readOnly && (
        <div
          className={cn('absolute inset-x-0 top-0 cursor-ns-resize')}
          style={{ height: 6, touchAction: 'none' }}
          onPointerDown={(e) => onDragStart(blockId, day, 'top', e)}
        />
      )}
      <div
        className="truncate px-1 py-0.5 text-[10px] font-medium leading-tight"
        style={{ color }}
      >
        {label}
        <br />
        <span className="opacity-75">
          {startTime}–{endTime}
        </span>
      </div>
      {!readOnly && (
        <div
          className={cn('absolute inset-x-0 bottom-0 cursor-ns-resize')}
          style={{ height: 6, touchAction: 'none' }}
          onPointerDown={(e) => onDragStart(blockId, day, 'bottom', e)}
        />
      )}
    </div>
  );
};

export default WeeklyScheduleCalendarBlock;
