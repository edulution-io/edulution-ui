import React from 'react';
import DatePicker from '@/components/shared/DatePicker';
import TimeInput from '@/components/shared/TimeInput';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { FaTrash } from 'react-icons/fa6';
import { FormMessage } from '@/components/ui/Form';

const DateAndTimeInput = ({
  form,
  name,
  translationId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
  name: string;
  translationId: string;
}) => {
  const { t } = useTranslation();
  const { setValue, watch, formState } = form;

  const handleIsVisibleStartDateChange = (value: Date | undefined) => {
    setValue(name, value ? value.toISOString() : null, { shouldValidate: true });
  };

  const handleResetButton = () => {
    setValue(name, null, { shouldValidate: true });
  };

  const selectedDate = watch(name) as Date;
  const errorMessage = formState.errors[name]?.message?.toString();

  return (
    <>
      <div className="flex items-center text-foreground">
        {t(translationId)}
        <div className="ml-2">
          <DatePicker
            selected={selectedDate || undefined}
            onSelect={handleIsVisibleStartDateChange}
          />
        </div>
        {selectedDate && (
          <>
            <div className="ml-2 flex items-center">
              <TimeInput
                form={form}
                fieldName={name}
                date={selectedDate}
              />
            </div>
            <Button
              variant="btn-attention"
              size="md"
              className="ml-4 rounded-md text-white"
              onClick={handleResetButton}
            >
              <FaTrash />
            </Button>
          </>
        )}
      </div>
      <div>{formState.errors[name] && <FormMessage className="text-p">{errorMessage}</FormMessage>}</div>
    </>
  );
};

export default DateAndTimeInput;
