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
