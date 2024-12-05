import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MdCheckCircle, MdError } from 'react-icons/md';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import useAppConfigBulletinTableStore from '../useAppConfigBulletinTableStore';

const NameInputWithAvailability = ({
  register,
  checkIfNameExists,
  placeholder,
}: {
  register: UseFormReturn<CreateBulletinCategoryDto>['register'];
  checkIfNameExists: (name: string) => Promise<boolean>;
  placeholder: string;
}) => {
  const { nameExists, setNameExists, isNameChecking, setIsNameChecking } = useAppConfigBulletinTableStore();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    console.log(name.length);
    if (!name) {
      setNameExists(null);
      return;
    }

    if (name.length < 3) {
      setNameExists(false);
      return;
    }

    setIsNameChecking(true);
    try {
      const isAvailable = await checkIfNameExists(name);
      setNameExists(isAvailable);
    } catch {
      setNameExists(false);
    } finally {
      setIsNameChecking(false);
    }
  };

  const renderAvailabilityStatus = () => {
    if (isNameChecking) {
      return <span className="text-sm text-gray-500">Checking...</span>;
    }

    if (!nameExists) {
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
      <input
        {...register('name')}
        placeholder={placeholder}
        className="input-class"
        onChange={handleChange}
      />
      {renderAvailabilityStatus()}
    </div>
  );
};

export default NameInputWithAvailability;
