import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { DialogContentSH, DialogSH, DialogTitleSH } from '@/components/ui/DialogSH.tsx';
import { t } from 'i18next';

interface PasswordChangeDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenChange: (isOpen: boolean) => void;
}

interface PasswordChangeFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeDialog: FC<PasswordChangeDialogProps> = ({ isOpen, setIsOpen, onOpenChange }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormInputs>();

  const onSubmit = () => {
    handleOpenChange(false);
    reset();
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    reset();
    if (onOpenChange) {
      onOpenChange(open);
    }
  };

  return (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContentSH className="text-black">
        <DialogTitleSH>Passwort ändern</DialogTitleSH>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium text-gray-700"
            >
              {t('changePassword.title')}
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
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
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
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
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
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {t('changePassword.title')}
            </button>
          </div>
        </form>
      </DialogContentSH>
    </DialogSH>
  );
};

export default PasswordChangeDialog;
