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
        form={form}
        defaultValue={form.getValues('name')}
        variant="dialog"
        onChange={handleInputChange}
      />

      {shouldAvailabilityStatusShow && renderAvailabilityStatus()}
    </div>
  );
};

export default NameInputWithAvailability;
