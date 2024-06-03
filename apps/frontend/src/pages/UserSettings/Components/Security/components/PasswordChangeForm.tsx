import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { t } from 'i18next';
import { Button } from '@/components/shared/Button.tsx';

interface PasswordChangeFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeForm: FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormInputs>();

  const onSubmit = () => {
    reset();
  };

  return (
    <div className="mb-4 pt-5 sm:pt-0">
      <h3>{t('changePassword.title')}</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="max-w-[50vh]">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-300"
          >
            {t('changePassword.currentPasswordRequired')}
          </label>
          <input
            id="currentPassword"
            type="password"
            {...register('currentPassword', { required: t('changePassword.currentPasswordRequired') })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.currentPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.currentPassword && <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>}
        </div>
        <div className="max-w-[50vh]">
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-300"
          >
            {t('changePassword.newPassword')}
          </label>
          <input
            id="newPassword"
            type="password"
            {...register('newPassword', {
              required: t('changePassword.newPasswordRequired'),
              minLength: { value: 8, message: t('changePassword.passwordLength') },
            })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.newPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
        </div>
        <div className="max-w-[50vh]">
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300"
          >
            {t('changePassword.confirmPassword')}
          </label>
          <input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: t('changePassword.confirmPasswordRequired'),
              validate: (value) => value === watch('newPassword') || t('changePassword.passwordsDoNotMatch'),
            })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>
        <div className="flex justify-end">
          <Button
            variant="btn-collaboration"
            size="sm"
            onClick={() => onSubmit()}
          >
            {t('changePassword.changePassword')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
