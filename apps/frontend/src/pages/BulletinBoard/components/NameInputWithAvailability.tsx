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

import React, { useEffect, useRef, useState } from 'react';
import { MdCheckCircle, MdError } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { useDebounceValue } from 'usehooks-ts';
import FormField from '@/components/shared/FormField';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import useBulletinCategoryTableStore from '../../Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';

interface NameInputWithAvailabilityProps {
  form: UseFormReturn<CreateBulletinCategoryDto>;
  placeholder: string;
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shouldAvailabilityStatusShow: boolean;
}

const NameInputWithAvailability = ({
  form,
  placeholder,
  onValueChange,
  shouldAvailabilityStatusShow,
}: NameInputWithAvailabilityProps) => {
  const { t } = useTranslation();
  const { nameExistsAlready, isNameCheckingLoading, checkIfNameAllReadyExists } = useBulletinCategoryTableStore();

  const [isActivelyTyping, setIsActivelyTyping] = useState(false);
  const [isNameChecked, setIsNameChecked] = useState(false);

  const watchedValue = form.watch('name', placeholder);

  const [debouncedValue] = useDebounceValue(watchedValue ?? '', 500);

  const lastValueRef = useRef('');

  useEffect(() => {
    setIsActivelyTyping(true);
    setIsNameChecked(false);
  }, [watchedValue]);

  useEffect(() => {
    const trimmedValue = debouncedValue.trim();
    if (trimmedValue && trimmedValue !== lastValueRef.current) {
      lastValueRef.current = trimmedValue;
      void (async () => {
        await checkIfNameAllReadyExists(trimmedValue);
        setIsActivelyTyping(false);
        setIsNameChecked(true);
      })();
    } else {
      setIsActivelyTyping(false);
      setIsNameChecked(false);
    }
  }, [debouncedValue, checkIfNameAllReadyExists]);

  const renderAvailabilityStatus = () => {
    if ((isActivelyTyping && !isNameChecked) || isNameCheckingLoading) {
      return <span className="text-sm text-gray-500">{t('common.checking')}...</span>;
    }

    if (isNameChecked) {
      if (!nameExistsAlready) {
        return (
          <MdCheckCircle
            className="text-ciGreen"
            size={20}
          />
        );
      }
      return (
        <MdError
          className="text-ciRed"
          size={20}
        />
      );
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e);
  };

  return (
    <div className="flex items-center space-x-2">
      <FormField
        name="name"
        defaultValue={placeholder}
        form={form}
        variant="dialog"
        onChange={handleInputChange}
      />

      {shouldAvailabilityStatusShow && renderAvailabilityStatus()}
    </div>
  );
};

export default NameInputWithAvailability;
