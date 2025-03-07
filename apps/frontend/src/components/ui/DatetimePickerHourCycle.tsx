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

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DateTimePicker } from '@/components/ui/DateTimePicker';

const defaultDate = new Date();
defaultDate.setMonth(defaultDate.getDay() + 7);
defaultDate.setHours(14, 30, 0, 0);

interface DatetimePickerHourCycleProps {
  value: Date | undefined;
  onChange: (value: Date | undefined) => void;
  defaultTime?: Date | undefined;
  translationId?: string;
}

const DatetimePickerHourCycle = (props: DatetimePickerHourCycleProps) => {
  const { value, onChange, defaultTime, translationId } = props;

  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 lg:flex-row">
      <div className="flex w-72 flex-col gap-2">
        {translationId ? <div className="text-background">{t(translationId)}</div> : null}
        <DateTimePicker
          hourCycle={24}
          value={value}
          onChange={onChange}
          defaultPopupValue={defaultTime || defaultDate}
        />
      </div>
    </div>
  );
};

export default DatetimePickerHourCycle;
