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
