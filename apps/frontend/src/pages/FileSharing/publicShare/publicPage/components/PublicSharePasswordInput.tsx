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

import React from 'react';
import { Controller, useFormContext, UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormField from '@/components/shared/FormField';

interface PublicSharePasswordInputProps {
  placeholder: string;
  onChanged?: (value: string) => void;
  disabled?: boolean;
  form: UseFormReturn<{ password?: string }>;
}

const PublicSharePasswordInput: React.FC<PublicSharePasswordInputProps> = ({
  placeholder,
  onChanged,
  disabled = false,
  form,
}) => {
  const { t } = useTranslation();
  const { control } = useFormContext<{ password: string }>();

  return (
    <div className="space-y-2">
      <p>{t('filesharing.publicFileSharing.getFileAccess')}</p>

      <Controller
        name="password"
        control={control}
        rules={{ required: t('common.min_chars', { count: 1 }) }}
        render={({ field }) => (
          <FormField
            name={field.name}
            form={form}
            type="password"
            value={field.value || ''}
            onChange={(e) => {
              field.onChange(e);
              onChanged?.(e.target.value);
            }}
            placeholder={placeholder}
            disabled={disabled}
            variant="dialog"
          />
        )}
      />
    </div>
  );
};

export default PublicSharePasswordInput;
