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

import React, { useEffect, useRef } from 'react';
import { MdCheckCircle, MdError } from 'react-icons/md';
import Input from '@/components/shared/Input';
import { useTranslation } from 'react-i18next';
import { Control, useWatch, Path } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import useBulletinCategoryTableStore from '../../Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';

interface NameInputWithAvailabilityProps<T extends { name: string }> {
  control: Control<T>;
  placeholder: string;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shouldAvailabilityStatusShow: boolean;
}

const NameInputWithAvailability = <T extends { name: string }>({
  control,
  placeholder,
  onValueChange,
  shouldAvailabilityStatusShow,
}: NameInputWithAvailabilityProps<T>) => {
  const { t } = useTranslation();
  const { nameExistsAlready, isNameCheckingLoading, checkIfNameAllReadyExists } = useBulletinCategoryTableStore();

  const watchedValue = useWatch<T>({ control, name: 'name' as Path<T> });

  const [debouncedValue] = useDebounceValue(watchedValue ?? '', 500);

  const lastValueRef = useRef('');

  useEffect(() => {
    const trimmed = debouncedValue.trim();
    if (trimmed && trimmed !== lastValueRef.current) {
      lastValueRef.current = trimmed;
      void checkIfNameAllReadyExists(trimmed);
    }
  }, [debouncedValue, checkIfNameAllReadyExists, onValueChange]);

  const renderAvailabilityStatus = () => {
    if (isNameCheckingLoading) {
      return <span className="text-sm text-gray-500">{t('common.checking')}...</span>;
    }
    if (!nameExistsAlready) {
      return (
        <MdCheckCircle
          className="text-green-500"
          size={20}
        />
      );
    }
    return (
      <MdError
        className="text-red-500"
        size={20}
      />
    );
  };

  return (
    <div className="flex items-center space-x-2">
      <Input
        placeholder={placeholder}
        onChange={onValueChange}
        className="input-class"
        variant="dialog"
      />
      {shouldAvailabilityStatusShow && renderAvailabilityStatus()}
    </div>
  );
};

export default NameInputWithAvailability;
