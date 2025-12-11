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

'use client';

import * as React from 'react';
import cn from '@libs/common/utils/className';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import DropdownVariant from '@libs/ui/types/DropdownVariant';

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  variant?: DropdownVariant;
};

const Calendar = ({ className, classNames, showOutsideDays = true, variant = 'default', ...props }: CalendarProps) => {
  const isDialog = variant === 'dialog';

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4',
        caption: 'flex justify-center pt-1 relative items-center',
        caption_label: 'text-sm font-medium text-secondary',
        nav: 'space-x-1 flex items-center',
        nav_button: cn(
          'h-7 w-7 p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border transition-colors',
          isDialog
            ? 'border-ring bg-transparent text-secondary hover:bg-accent'
            : 'border-accent bg-transparent text-secondary hover:bg-accent',
        ),
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-secondary rounded-md w-9 font-normal text-[0.8rem]',
        row: 'flex w-full mt-2',
        cell: cn(
          'h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
          '[&:has([aria-selected].day-range-end)]:rounded-r-md',
          '[&:has([aria-selected])]:rounded-md',
          'first:[&:has([aria-selected])]:rounded-l-md',
          'last:[&:has([aria-selected])]:rounded-r-md',
        ),
        day: cn(
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100 inline-flex items-center justify-center rounded-md transition-colors text-secondary',
          isDialog ? 'hover:bg-muted-light' : 'hover:bg-accent',
        ),
        day_range_end: 'day-range-end',
        day_selected:
          'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
        day_today: cn('font-bold', isDialog ? 'bg-muted-light text-secondary' : 'bg-accent text-secondary'),
        day_outside: 'day-outside text-secondary/50 opacity-50 aria-selected:opacity-30',
        day_disabled: 'text-secondary/30 opacity-50',
        day_range_middle: cn(
          isDialog ? 'aria-selected:bg-muted-light' : 'aria-selected:bg-accent',
          'aria-selected:text-secondary',
        ),
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        // eslint-disable-next-line
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        // eslint-disable-next-line
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
};

Calendar.displayName = 'Calendar';

export { Calendar };
