'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Calendar as CalendarIcon } from 'lucide-react';
import cn from '@libs/common/utils/className';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';
import useUserStore from '@/store/UserStore/UserStore';
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
