import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { MdCheckCircle, MdError } from 'react-icons/md';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import Input from '@/components/shared/Input';
import useAppConfigBulletinTableStore from '../useAppConfigBulletinTableStore';

const NameInputWithAvailability = ({
  value,
  register,
  checkIfNameExists,
  placeholder,
}: {
  value: string;
  register: UseFormReturn<CreateBulletinCategoryDto>['register'];
  checkIfNameExists: (name: string) => Promise<boolean>;
  placeholder: string;
}) => {
  const { nameExists, setNameExists, isNameChecking, setIsNameChecking } = useAppConfigBulletinTableStore();

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value.trim();
    if (name === value && name.length >= 3) {
      // check if updated name is the same as the previous one -> no need to check
      setNameExists(false);
      return;
    }
    if (!name) {
      setNameExists(null);
      return;
    }

    if (name.length < 3) {
      setNameExists(true);
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

  const triggerNameCheck = async () => {
    await handleChange({ target: { value: value.trim() } } as React.ChangeEvent<HTMLInputElement>);
  };

  useEffect(() => {
    void triggerNameCheck();
  }, []);

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
      <Input
        {...register('name')}
        placeholder={placeholder}
        className="input-class"
        onChange={handleChange}
        variant="light"
      />
      {renderAvailabilityStatus()}
    </div>
  );
};

export default NameInputWithAvailability;
