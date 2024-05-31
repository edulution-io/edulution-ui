import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { DialogContentSH, DialogSH, DialogTitleSH } from '@/components/ui/DialogSH.tsx';

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
    formState: { errors },
  } = useForm<PasswordChangeFormInputs>();

  const onSubmit = (data: PasswordChangeFormInputs) => {
    console.log(data);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
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
              Aktuelles Passwort
            </label>
            <input
              id="currentPassword"
              type="password"
              {...register('currentPassword', { required: 'Aktuelles Passwort ist erforderlich' })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.currentPassword && <p className="mt-2 text-sm text-red-600">{errors.currentPassword.message}</p>}
          </div>
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Neues Passwort
            </label>
            <input
              id="newPassword"
              type="password"
              {...register('newPassword', {
                required: 'Neues Passwort ist erforderlich',
                minLength: { value: 8, message: 'Das Passwort muss mindestens 8 Zeichen lang sein' },
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.newPassword && <p className="mt-2 text-sm text-red-600">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', {
                required: 'Passwortbestätigung ist erforderlich',
                validate: (value) => value === watch('newPassword') || 'Die Passwörter stimmen nicht überein',
              })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
            {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword.message}</p>}
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => handleOpenChange(false)}
            >
              Passwort ändern
            </button>
          </div>
        </form>
      </DialogContentSH>
    </DialogSH>
  );
};

export default PasswordChangeDialog;
