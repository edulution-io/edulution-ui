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

import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { t } from 'i18next';
import { Button } from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import Label from '@/components/ui/Label';
import useUserSettingsPageStore from '@/pages/UserSettings/Security/useUserSettingsPageStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';

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
      <LoadingIndicatorDialog isOpen={isLoading} />
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
            className={`mb-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.currentPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.currentPassword && <p className="mb-2 text-sm text-red-600">{errors.currentPassword.message}</p>}
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
            className={`mb-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.newPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.newPassword && <p className="mb-2 text-sm text-red-600">{errors.newPassword.message}</p>}
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
            className={`mb-1 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
          />
          {errors.confirmPassword && <p className="mb-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
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
