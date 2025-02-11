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

import React, { useEffect, useState } from 'react';
import { getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import Input from '@/components/shared/Input';
import cn from '@libs/common/utils/className';
import { FieldValues, Path, PathValue, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface TimeInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  fieldName: Path<T>;
  date?: Date | null;
  disabled?: boolean;
}

const TimeInput = <T extends FieldValues>({ form, disabled, fieldName, date }: TimeInputProps<T>) => {
  const { t } = useTranslation();
  const { setValue } = form;

  const initialValue = date || new Date();

  const [expirationTime, setExpirationTime] = useState<string>(
    `${getHours(initialValue).toString().padStart(2, '0')}:${getMinutes(initialValue).toString().padStart(2, '0')}`,
  );

  const handleExpirationTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value.split(':');
    if (!time[0] || !time[1]) return;

    let updateExpiration = date ? new Date(date) : new Date();
    updateExpiration = setHours(updateExpiration, Number(time[0]));
    updateExpiration = setMinutes(updateExpiration, Number(time[1]));
    setExpirationTime(e.target.value);
    setValue(fieldName, updateExpiration.toISOString() as PathValue<T, Path<T>>);
  };

  useEffect(() => {
    if (date) {
      setExpirationTime(
        `${getHours(date).toString().padStart(2, '0')}:${getMinutes(date).toString().padStart(2, '0')}`,
      );
    }
  }, [date]);

  return (
    // TODO change the background color to bg-foreground @Dominik
    <>
      {t('common.time')}
      <Input
        type="time"
        value={expirationTime}
        onChange={handleExpirationTimeChange}
        className={cn('ml-2', { 'text-gray-300': !expirationTime }, { 'text-background': expirationTime })}
        disabled={disabled}
      />
    </>
  );
};

export default TimeInput;
