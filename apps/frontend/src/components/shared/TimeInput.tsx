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
