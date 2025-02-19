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

import React, { HTMLInputTypeAttribute } from 'react';
import { useTranslation } from 'react-i18next';
import { type VariantProps } from 'class-variance-authority';
import Input, { originInputVariants } from '@/components/shared/Input';
import Label from '@/components/ui/Label';
import cn from '@libs/common/utils/className';

type FormFieldProps = {
  value?: string | number;
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
          <p className="font-bold">{t(labelTranslationId)}</p>
        </Label>
      )}
      <Input
        type={type}
        disabled={disabled || isLoading}
        variant={variant}
        readOnly={readOnly}
        value={value || t('common.not-available')}
        placeholder={placeholder}
        onChange={onChange}
        className={cn(className, { 'italic text-muted': !value })}
      />
    </>
  );
};

export default Field;
