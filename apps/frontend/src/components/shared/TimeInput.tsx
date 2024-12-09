import React, { useState } from 'react';
import { getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import Input from '@/components/shared/Input';
import cn from '@libs/common/utils/className';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface TimeInputProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  fieldName: string;
  disabled?: boolean;
}

const TimeInput = ({ form, disabled, fieldName }: TimeInputProps) => {
  const { t } = useTranslation();
  const { setValue, getValues } = form;

  const [expirationTime, setExpirationTime] = useState<string>(
    `${getHours(getValues(fieldName)) || '00'}:${getMinutes(getValues(fieldName)) || '00'}`,
  );

  const handleExpirationTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpirationTime(e.target.value);
    const time = e.target.value.split(':');
    let updateExpiration = getValues(fieldName) as Date;
    updateExpiration = setHours(updateExpiration, Number(time[0]));
    updateExpiration = setMinutes(updateExpiration, Number(time[1]));
    setValue(fieldName, updateExpiration);
  };

  return (
    <div>
      {t('common.time')}
      <Input
        type="time"
        value={expirationTime}
        onChange={handleExpirationTimeChange}
        variant="default"
        className={cn('ml-2', { 'text-gray-300': !expirationTime }, { 'text-foreground': expirationTime })}
        disabled={disabled}
      />
    </div>
  );
};

export default TimeInput;
