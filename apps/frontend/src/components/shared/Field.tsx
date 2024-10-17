import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import { type VariantProps } from 'class-variance-authority';
import Input, { originInputVariants } from '@/components/shared/Input';
import Label from '@/components/ui/Label';

type FormFieldProps = {
  value: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: HTMLInputTypeAttribute;
  placeholder?: string | undefined;
  labelTranslationId?: string;
  readOnly?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
} & VariantProps<typeof originInputVariants>;

const Field = ({
  value,
  onChange,
  type,
  placeholder,
  labelTranslationId,
  variant,
  readOnly,
  disabled,
  isLoading,
  className,
}: FormFieldProps) => {
  const { t } = useTranslation();

  return (
    <>
      {labelTranslationId && (
        <Label>
          <p className="font-bold">{t(labelTranslationId)}:</p>
        </Label>
      )}
      <Input
        type={type}
        disabled={disabled || isLoading}
        variant={variant}
        readOnly={readOnly}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        className={className}
      />
    </>
  );
};

export default Field;
