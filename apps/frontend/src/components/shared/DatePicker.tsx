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
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import cn from '@libs/common/utils/className';
import useLanguage from '@/hooks/useLanguage';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import { Button } from '@/components/shared/Button';

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (dates: Date | undefined) => void;
}

const DatePicker = (props: DatePickerProps) => {
  const { selected, onSelect } = props;
  const { language } = useLanguage();
  const { t } = useTranslation();

  const locale = getLocaleDateFormat(language);

  return (
    <span className="min-w-[150px] max-w-[150px] flex-shrink-0 flex-grow-0 overflow-auto text-background">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              'h-9 justify-start rounded bg-accent py-0 text-left font-normal text-background',
              !selected && 'opacity-80',
            )}
          >
            <CalendarIcon className="mr-2 h-6 w-6 text-background" />
            {selected ? format(selected, 'PPP', { locale }) : t(`common.select`)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto bg-accent p-0 font-normal text-background shadow-lg">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={onSelect}
            locale={locale}
            classNames={{
              day_selected: 'text-secondary',
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </span>
  );
};

export default DatePicker;
