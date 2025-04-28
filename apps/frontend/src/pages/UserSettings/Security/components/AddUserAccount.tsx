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

import React, { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';
import { zodResolver } from '@hookform/resolvers/zod';
import useUserStore from '@/store/UserStore/UserStore';
import { deriveKey, encryptPassword } from '@libs/common/utils/encryptPassword';
import getUserAccountFormSchema from './getUserAccountSchema';

interface AddUserAccountDialogProps {
  isOpen: boolean;
  isOneRowSelected: boolean;
  keys: string[];
  handleOpenChange: () => void;
}

type UserAccountFormValues = {
  accountUrl: string;
  accountUser: string;
  accountPassword: string;
  masterPassword: string;
};

const AddUserAccount: FC<AddUserAccountDialogProps> = ({ isOpen, isOneRowSelected, keys, handleOpenChange }) => {
  const { t } = useTranslation();
  const { userAccounts, addUserAccount, updateUserAccount } = useUserStore();
  const idx = isOneRowSelected ? Number(keys[0]) : undefined;

  const initialFormValues: UserAccountFormValues =
    idx !== undefined && userAccounts[idx]
      ? {
          accountUrl: userAccounts[idx].accountUrl,
          accountUser: userAccounts[idx].accountUser,
          accountPassword: '',
          masterPassword: '',
        }
      : {
          accountUrl: '',
          accountUser: '',
          accountPassword: '',
          masterPassword: '',
        };

  const form = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(getUserAccountFormSchema(t)),
    defaultValues: initialFormValues,
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(initialFormValues);
    }
  }, [isOpen]);

  const handleClose = () => {
    handleOpenChange();
    form.reset();
  };

  const onSubmit = async (data: UserAccountFormValues) => {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(data.masterPassword, salt);
    const { iv, ciphertext } = await encryptPassword(data.accountPassword, key);

    const newPassword = {
      ciphertext: Array.from(new Uint8Array(ciphertext)),
      iv: Array.from(iv),
      salt: Array.from(salt),
    };

    const userDataDto = {
      accountUrl: data.accountUrl,
      accountUser: data.accountUser,
      accountPassword: JSON.stringify(newPassword),
    };

    if (idx !== undefined) {
      const { accountId } = userAccounts[idx];

      const updatedUserDataDto = {
        ...userDataDto,
        accountId,
      };

      await updateUserAccount(accountId, updatedUserDataDto);
    } else {
      await addUserAccount(userDataDto);
    }
    handleClose();
  };

  const getDialogBody = () => (
    <Form {...form}>
      <form
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <FormField
          labelTranslationId={t('usersettings.security.accountUrl')}
          name="accountUrl"
          defaultValue={initialFormValues.accountUrl}
          form={form}
          variant="dialog"
        />
        <FormField
          labelTranslationId={t('common.username')}
          name="accountUser"
          defaultValue={initialFormValues.accountUser}
          form={form}
          variant="dialog"
        />
        <FormField
          labelTranslationId={t('common.password')}
          name="accountPassword"
          defaultValue={initialFormValues.accountPassword}
          form={form}
          variant="dialog"
          type="password"
        />
        <FormField
          labelTranslationId={t('usersettings.security.masterPassword')}
          name="masterPassword"
          defaultValue=""
          form={form}
          variant="dialog"
          type="password"
        />
      </form>
    </Form>
  );

  const getFooter = () => (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={() => {}}
        submitButtonType="submit"
      />
    </form>
  );

  return (
    <AdaptiveDialog
      body={getDialogBody()}
      footer={getFooter()}
      isOpen={isOpen}
      handleOpenChange={handleOpenChange}
      title={t('usersettings.security.addUserAccount')}
    />
  );
};

export default AddUserAccount;
