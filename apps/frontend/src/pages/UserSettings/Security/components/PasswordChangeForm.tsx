import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { t } from 'i18next';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import useUserSettingsPageStore from '@/pages/UserSettings/Security/useUserSettingsPageStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

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
    getValues,
    formState: { errors },
  } = useForm<PasswordChangeFormInputs>();
  const { changePassword, isLoading } = useUserSettingsPageStore();

  const onSubmit = async () => {
    const success = await changePassword(getValues('currentPassword'), getValues('newPassword'));
    if (success) reset();
  };

  return (
    <div className="mb-4 pt-5 sm:pt-0">
      <LoadingIndicator isOpen={isLoading} />
      <h3>{t('usersettings.security.changePassword.title')}</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="md:max-w-[75%]">
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-300"
          >
            {t('usersettings.security.changePassword.currentPassword')}
          </label>
          <Input
            id="currentPassword"
            type="password"
            variant="lightGray"
            {...register('currentPassword', { required: t('usersettings.errors.currentPasswordRequired') })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.currentPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.currentPassword && <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>}
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-300"
          >
            {t('usersettings.security.changePassword.newPassword')}
          </label>
          <Input
            id="newPassword"
            type="password"
            variant="lightGray"
            {...register('newPassword', {
              required: t('usersettings.errors.newPasswordRequired'),
              minLength: { value: 8, message: t('usersettings.errors.passwordLength') },
            })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.newPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300"
          >
            {t('usersettings.security.changePassword.confirmPassword')}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            variant="lightGray"
            {...register('confirmPassword', {
              required: t('usersettings.errors.confirmPasswordRequired'),
              validate: (value) => value === watch('newPassword') || t('usersettings.errors.passwordsDoNotMatch'),
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
            type="submit"
          >
            {t('usersettings.security.changePassword.confirm')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PasswordChangeForm;
