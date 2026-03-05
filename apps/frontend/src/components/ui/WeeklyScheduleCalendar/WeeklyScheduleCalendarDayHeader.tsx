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

interface WeeklyScheduleCalendarDayHeaderProps {
  dayLabels: string[];
}

const WeeklyScheduleCalendarDayHeader = ({ dayLabels }: WeeklyScheduleCalendarDayHeaderProps) => (
  <div
    className="sticky top-0 z-20 grid bg-white dark:bg-background"
    style={{ gridTemplateColumns: `50px repeat(${7}, 1fr)` }}
  >
    <div />
    {dayLabels.map((label) => (
      <div
        key={label}
        className="border-b border-l border-muted py-2 text-center text-xs font-medium text-muted-foreground"
      >
        {label}
      </div>
    ))}
  </div>
);

export default WeeklyScheduleCalendarDayHeader;
