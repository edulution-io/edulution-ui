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
import { MdCheckCircle, MdError } from 'react-icons/md';
import Input from '@/components/shared/Input';
import { useTranslation } from 'react-i18next';
import { UseFormRegisterReturn } from 'react-hook-form';
import useBulletinCategoryTableStore from '../../Settings/AppConfig/bulletinboard/useBulletinCategoryTableStore';

interface NameInputWithAvailabilityProps {
  register: UseFormRegisterReturn<'name'>;
  placeholder: string;
  onValueChange: (newValue: string) => void;
  shouldAvailabilityStatusShow: boolean;
}

const NameInputWithAvailability = ({
  register,
  placeholder,
  onValueChange,
  shouldAvailabilityStatusShow,
}: NameInputWithAvailabilityProps) => {
  const { t } = useTranslation();
  const { nameExistsAlready, isNameCheckingLoading, checkIfNameAllReadyExists } = useBulletinCategoryTableStore();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
    await checkIfNameAllReadyExists(e.target.value);
  };

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
        {...register}
        placeholder={placeholder}
        className="input-class"
        onChange={handleChange}
      />
      {shouldAvailabilityStatusShow && renderAvailabilityStatus()}
    </div>
  );
};

export default NameInputWithAvailability;
