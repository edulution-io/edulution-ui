import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { t } from 'i18next';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';
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
    <div className="pt-5 sm:pt-0">
      <LoadingIndicator isOpen={isLoading} />
      <h3 className="text-background">{t('usersettings.security.changePassword.title')}</h3>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 py-4"
      >
        <div className="md:max-w-[75%]">
          <Label
            htmlFor="currentPassword"
            className="block text-sm font-medium"
          >
            <p className="font-bold text-secondary">{t('usersettings.security.changePassword.currentPassword')}</p>
          </Label>
          <Input
            id="currentPassword"
            type="password"
            {...register('currentPassword', { required: t('usersettings.errors.currentPasswordRequired') })}
            className={`mb-4 mt-1 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.currentPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.currentPassword && <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>}
          <Label
            htmlFor="newPassword"
            className="block text-sm font-medium"
          >
            <p className="font-bold text-secondary">{t('usersettings.security.changePassword.newPassword')}</p>
          </Label>
          <Input
            id="newPassword"
            type="password"
            {...register('newPassword', {
              required: t('usersettings.errors.newPasswordRequired'),
              minLength: { value: 8, message: t('usersettings.errors.passwordLength') },
            })}
            className={`mb-4 mt-1 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.newPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
          <Label
            htmlFor="confirmPassword"
            className="block text-sm font-medium"
          >
            <p className="font-bold text-secondary">{t('usersettings.security.changePassword.confirmPassword')}</p>
          </Label>
          <Input
            id="confirmPassword"
            type="password"
            {...register('confirmPassword', {
              required: t('usersettings.errors.confirmPasswordRequired'),
              validate: (value) => value === watch('newPassword') || t('usersettings.errors.passwordsDoNotMatch'),
            })}
            className={`mb-4 mt-1 mt-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
        </div>
        <div className="flex justify-end">
          <Button
            variant="btn-security"
            size="lg"
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
