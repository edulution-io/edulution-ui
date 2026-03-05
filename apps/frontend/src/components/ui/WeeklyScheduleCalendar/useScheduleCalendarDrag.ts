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

import { useState, useCallback, useRef } from 'react';
import parseTimeToMinutes from '@libs/common/utils/parseTimeToMinutes';
import minutesToTimeString from '@libs/common/utils/minutesToTimeString';
import type ScheduleBlock from '@/components/ui/WeeklyScheduleCalendar/types/ScheduleBlock';

type DragEdge = 'top' | 'bottom';

interface DragState {
  blockId: string;
  day: number;
  edge: DragEdge;
  initialY: number;
  initialMinutes: number;
  isDragging: boolean;
}

const snapToStep = (minutes: number, step: number): number => Math.round(minutes / step) * step;

interface UseScheduleCalendarDragOptions {
  blocks: ScheduleBlock[];
  pixelsPerHour: number;
  stepMinutes: number;
  visibleStartHour: number;
  visibleEndHour: number;
  onBlockTimeChange: (blockId: string, day: number, startTime: string, endTime: string) => void;
}

const useScheduleCalendarDrag = ({
  blocks,
  pixelsPerHour,
  stepMinutes,
  visibleStartHour,
  visibleEndHour,
  onBlockTimeChange,
}: UseScheduleCalendarDragOptions) => {
  const [previewTime, setPreviewTime] = useState<{ blockId: string; startTime: string; endTime: string } | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const handleDragStart = useCallback(
    (blockId: string, day: number, edge: DragEdge, e: React.PointerEvent) => {
      const block = blocks.find((b) => b.id === blockId);
      if (!block) return;

      const initialMinutes = edge === 'top' ? parseTimeToMinutes(block.startTime) : parseTimeToMinutes(block.endTime);

      dragRef.current = {
        blockId,
        day,
        edge,
        initialY: e.clientY,
        initialMinutes,
        isDragging: false,
      };

      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [blocks],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const deltaY = e.clientY - drag.initialY;

      if (!drag.isDragging && Math.abs(deltaY) < 5) return;
      drag.isDragging = true;

      const deltaMinutes = (deltaY / pixelsPerHour) * 60;
      const rawMinutes = drag.initialMinutes + deltaMinutes;
      const snapped = snapToStep(rawMinutes, stepMinutes);

      const block = blocks.find((b) => b.id === drag.blockId);
      if (!block) return;

      const minMinutes = visibleStartHour * 60;
      const maxMinutes = visibleEndHour * 60;

      let newStart: number;
      let newEnd: number;

      if (drag.edge === 'top') {
        const currentEnd = parseTimeToMinutes(block.endTime);
        newStart = Math.max(minMinutes, Math.min(snapped, currentEnd - stepMinutes));
        newEnd = currentEnd;
      } else {
        const currentStart = parseTimeToMinutes(block.startTime);
        newStart = currentStart;
        newEnd = Math.min(maxMinutes, Math.max(snapped, currentStart + stepMinutes));
      }

      setPreviewTime({
        blockId: drag.blockId,
        startTime: minutesToTimeString(newStart),
        endTime: minutesToTimeString(newEnd),
      });
    },
    [blocks, pixelsPerHour, stepMinutes, visibleStartHour, visibleEndHour],
  );

  const handlePointerUp = useCallback(() => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.isDragging && previewTime) {
      onBlockTimeChange(previewTime.blockId, drag.day, previewTime.startTime, previewTime.endTime);
    }

    dragRef.current = null;
    setPreviewTime(null);
  }, [previewTime, onBlockTimeChange]);

  const getBlockTimes = useCallback(
    (block: ScheduleBlock) => {
      if (previewTime && previewTime.blockId === block.id) {
        return { startTime: previewTime.startTime, endTime: previewTime.endTime };
      }
      return { startTime: block.startTime, endTime: block.endTime };
    },
    [previewTime],
  );

  const isDragging = dragRef.current?.isDragging ?? false;

  return {
    handleDragStart,
    handlePointerMove,
    handlePointerUp,
    getBlockTimes,
    isDragging,
  };
};

export default useScheduleCalendarDrag;
