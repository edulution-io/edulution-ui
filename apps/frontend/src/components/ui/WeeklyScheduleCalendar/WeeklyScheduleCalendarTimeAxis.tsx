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

interface WeeklyScheduleCalendarTimeAxisProps {
  visibleStartHour: number;
  visibleEndHour: number;
  pixelsPerHour: number;
}

const WeeklyScheduleCalendarTimeAxis = ({
  visibleStartHour,
  visibleEndHour,
  pixelsPerHour,
}: WeeklyScheduleCalendarTimeAxisProps) => {
  const hours: number[] = [];
  for (let h = visibleStartHour; h <= visibleEndHour; h += 1) {
    hours.push(h);
  }

  return (
    <div
      className="sticky left-0 z-10 bg-white dark:bg-background"
      style={{ width: 50 }}
    >
      {hours.map((hour) => (
        <div
          key={hour}
          className="relative pr-2 text-right text-xs text-muted-foreground"
          style={{ height: pixelsPerHour, marginTop: hour === visibleStartHour ? 0 : undefined }}
        >
          <span className="absolute -top-2 right-2">{`${String(hour).padStart(2, '0')}:00`}</span>
        </div>
      ))}
    </div>
  );
};

export default WeeklyScheduleCalendarTimeAxis;
