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

import React, { useMemo, useCallback } from 'react';
import { cn } from '@edulution-io/ui-kit';
import parseTimeToMinutes from '@libs/common/utils/parseTimeToMinutes';
import type ScheduleBlock from '@/components/ui/WeeklyScheduleCalendar/types/ScheduleBlock';
import WeeklyScheduleCalendarDayHeader from '@/components/ui/WeeklyScheduleCalendar/WeeklyScheduleCalendarDayHeader';
import WeeklyScheduleCalendarTimeAxis from '@/components/ui/WeeklyScheduleCalendar/WeeklyScheduleCalendarTimeAxis';
import WeeklyScheduleCalendarBlock from '@/components/ui/WeeklyScheduleCalendar/WeeklyScheduleCalendarBlock';
import useScheduleCalendarDrag from '@/components/ui/WeeklyScheduleCalendar/useScheduleCalendarDrag';

interface WeeklyScheduleCalendarProps {
  blocks: ScheduleBlock[];
  onBlockTimeChange: (blockId: string, day: number, startTime: string, endTime: string) => void;
  onBlockClick?: (blockId: string, day: number) => void;
  onEmptyCellDoubleClick?: (day: number) => void;
  visibleStartHour?: number;
  visibleEndHour?: number;
  stepMinutes?: number;
  pixelsPerHour?: number;
  dayLabels?: string[];
  readOnly?: boolean;
  className?: string;
}

interface ColumnAssignment {
  block: ScheduleBlock;
  columnIndex: number;
  columnCount: number;
}

const computeOverlapColumns = (dayBlocks: ScheduleBlock[]): ColumnAssignment[] => {
  if (dayBlocks.length === 0) return [];

  const sorted = [...dayBlocks].sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const columns: ScheduleBlock[][] = [];

  sorted.forEach((block) => {
    const blockStart = parseTimeToMinutes(block.startTime);
    let placed = false;

    for (let col = 0; col < columns.length; col += 1) {
      const lastInCol = columns[col][columns[col].length - 1];
      if (parseTimeToMinutes(lastInCol.endTime) <= blockStart) {
        columns[col].push(block);
        placed = true;
        break;
      }
    }

    if (!placed) {
      columns.push([block]);
    }
  });

  const totalColumns = columns.length;
  const assignments: ColumnAssignment[] = [];

  columns.forEach((col, colIndex) => {
    col.forEach((block) => {
      assignments.push({ block, columnIndex: colIndex, columnCount: totalColumns });
    });
  });

  return assignments;
};

const WeeklyScheduleCalendar = ({
  blocks,
  onBlockTimeChange,
  onBlockClick,
  onEmptyCellDoubleClick,
  visibleStartHour = 0,
  visibleEndHour = 24,
  stepMinutes = 15,
  pixelsPerHour = 60,
  dayLabels = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
  readOnly = false,
  className,
}: WeeklyScheduleCalendarProps) => {
  const totalHours = visibleEndHour - visibleStartHour;
  const gridHeight = totalHours * pixelsPerHour;

  const { handleDragStart, handlePointerMove, handlePointerUp, getBlockTimes, isDragging } = useScheduleCalendarDrag({
    blocks,
    pixelsPerHour,
    stepMinutes,
    visibleStartHour,
    visibleEndHour,
    onBlockTimeChange,
  });

  const dayColumnAssignments = useMemo(() => {
    const result: ColumnAssignment[][] = [];
    for (let day = 0; day < 7; day += 1) {
      const dayBlocks = blocks.filter((b) => b.days.includes(day));
      result.push(computeOverlapColumns(dayBlocks));
    }
    return result;
  }, [blocks]);

  const handleCellDoubleClick = useCallback(
    (day: number) => {
      if (readOnly || isDragging) return;
      onEmptyCellDoubleClick?.(day);
    },
    [readOnly, isDragging, onEmptyCellDoubleClick],
  );

  const handleBlockClick = useCallback(
    (blockId: string, day: number, e: React.MouseEvent) => {
      if (readOnly || isDragging) return;
      e.stopPropagation();
      onBlockClick?.(blockId, day);
    },
    [readOnly, isDragging, onBlockClick],
  );

  const hourLines = useMemo(() => {
    const lines: number[] = [];
    for (let h = visibleStartHour; h <= visibleEndHour; h += 1) {
      lines.push(h);
    }
    return lines;
  }, [visibleStartHour, visibleEndHour]);

  return (
    <div className={cn('max-h-[600px] overflow-auto rounded-md border border-muted', className)}>
      <div className="min-w-[640px]">
        <WeeklyScheduleCalendarDayHeader dayLabels={dayLabels} />
        <div
          className="grid"
          style={{ gridTemplateColumns: `50px repeat(${7}, 1fr)` }}
          onPointerMove={readOnly ? undefined : handlePointerMove}
          onPointerUp={readOnly ? undefined : handlePointerUp}
        >
          <WeeklyScheduleCalendarTimeAxis
            visibleStartHour={visibleStartHour}
            visibleEndHour={visibleEndHour}
            pixelsPerHour={pixelsPerHour}
          />

          {Array.from({ length: 7 }, (_, day) => (
            <div
              key={day}
              className="relative border-l border-muted"
              style={{ height: gridHeight }}
              onDoubleClick={() => handleCellDoubleClick(day)}
            >
              {hourLines.map((hour) => (
                <div
                  key={hour}
                  className="border-muted/50 absolute inset-x-0 border-b"
                  style={{ top: (hour - visibleStartHour) * pixelsPerHour }}
                />
              ))}

              {dayColumnAssignments[day].map(({ block, columnIndex, columnCount }) => {
                const times = getBlockTimes(block);
                return (
                  <WeeklyScheduleCalendarBlock
                    key={block.id}
                    blockId={block.id}
                    day={day}
                    label={block.label}
                    color={block.color}
                    startTime={times.startTime}
                    endTime={times.endTime}
                    pixelsPerHour={pixelsPerHour}
                    visibleStartHour={visibleStartHour}
                    columnCount={columnCount}
                    columnIndex={columnIndex}
                    readOnly={readOnly}
                    onDragStart={handleDragStart}
                    onClick={handleBlockClick}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export type { WeeklyScheduleCalendarProps };
export default WeeklyScheduleCalendar;
