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

'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import cn from '@libs/common/utils/className';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import useUserStore from '@/store/UserStore/useUserStore';
import getLocaleDateFormat from '@libs/common/utils/getLocaleDateFormat';
import UserLanguage from '@libs/user/constants/userLanguage';
import { Button } from '@/components/shared/Button';

interface DatePickerProps {
  selected: Date | undefined;
  onSelect: (dates: Date | undefined) => void;
}

const DatePicker = (props: DatePickerProps) => {
  const { selected, onSelect } = props;
  const { user } = useUserStore();
  const { t } = useTranslation();

  const locale = getLocaleDateFormat(user?.language === UserLanguage.SYSTEM ? navigator.language : user?.language);

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
