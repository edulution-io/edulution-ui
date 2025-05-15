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

import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import FormField from '@/components/shared/FormField';
import { Form, FormControl, FormDescription, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { zodResolver } from '@hookform/resolvers/zod';
import useUserStore from '@/store/UserStore/UserStore';
import { decryptPassword, deriveKey, encryptPassword } from '@libs/common/utils/encryptPassword';
import { DropdownSelect } from '@/components';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import getDisplayName from '@/utils/getDisplayName';
import useLanguage from '@/hooks/useLanguage';
import { decodeBase64, encodeBase64 } from '@libs/common/utils/getBase64String';
import TotpInput from '@/pages/LoginPage/components/TotpInput';
import cn from '@libs/common/utils/className';
import type EncryptedPasswordObject from '@libs/common/types/encryptPasswordObject';
import getUserAccountFormSchema from './getUserAccountSchema';

interface AddUserAccountDialogProps {
  isOpen: boolean;
  isOneRowSelected: boolean;
  keys: string[];
  handleOpenChange: () => void;
}

type UserAccountFormValues = {
  appName: string;
  accountUser: string;
  accountPassword: string;
  safePin: string;
};

const AddUserAccountDialog: FC<AddUserAccountDialogProps> = ({ isOpen, isOneRowSelected, keys, handleOpenChange }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { userAccounts, addUserAccount, updateUserAccount } = useUserStore();
  const { appConfigs } = useAppConfigsStore();
  const [enterSafePin, setEnterSafePin] = useState(false);
  const idx = isOneRowSelected ? Number(keys[0]) : undefined;
  const isFirstUserAccount = userAccounts.length === 0;

  const initialFormValues: UserAccountFormValues =
    idx !== undefined && userAccounts[idx]
      ? {
          appName: userAccounts[idx].appName,
          accountUser: userAccounts[idx].accountUser,
          accountPassword: '',
          safePin: '',
        }
      : {
          appName: '',
          accountUser: '',
          accountPassword: '',
          safePin: '',
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
    setEnterSafePin(false);
  };

  const onSubmit = async (data: UserAccountFormValues) => {
    if (!isFirstUserAccount) {
      const isSafePinValid = await decryptPassword(
        JSON.parse(decodeBase64(userAccounts[0].accountPassword)) as EncryptedPasswordObject,
        data.safePin,
      );

      if (!isSafePinValid) {
        form.setValue('safePin', '');
        toast.error(t('usersettings.security.wrongSafePin'));
        return;
      }
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await deriveKey(data.safePin, salt);
    const { iv, ciphertext } = await encryptPassword(data.accountPassword, key);

    const newPassword = {
      ciphertext: Array.from(new Uint8Array(ciphertext)),
      iv: Array.from(iv),
      salt: Array.from(salt),
    };

    const userAccountDto = {
      appName: data.appName,
      accountUser: data.accountUser,
      accountPassword: encodeBase64(JSON.stringify(newPassword)),
    };

    if (idx !== undefined) {
      const { accountId } = userAccounts[idx];

      const updatedUserAccountDto = {
        ...userAccountDto,
        accountId,
      };

      await updateUserAccount(accountId, updatedUserAccountDto);
    } else {
      await addUserAccount(userAccountDto);
    }
    handleClose();
  };

  const appNameOptions = appConfigs.map((appConfig) => ({
    id: appConfig.name,
    name: getDisplayName(appConfig, language),
  }));

  const getDialogBody = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {!enterSafePin && (
          <div className="flex flex-col gap-4">
            <FormFieldSH
              control={form.control}
              name="appName"
              defaultValue={initialFormValues.appName}
              render={({ field }) => (
                <FormItem>
                  <p className="font-bold">{t('common.application')}</p>
                  <FormControl>
                    <DropdownSelect
                      options={appNameOptions}
                      selectedVal={field.value}
                      handleChange={field.onChange}
                      variant="dialog"
                    />
                  </FormControl>
                </FormItem>
              )}
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
          </div>
        )}
        {enterSafePin && (
          <div>
            <FormFieldSH
              control={form.control}
              name="safePin"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <TotpInput
                      totp={field.value}
                      maxLength={5}
                      title={t(
                        isFirstUserAccount
                          ? 'usersettings.security.firstEnterSafePin'
                          : 'usersettings.security.enterSavePin',
                      )}
                      setTotp={field.onChange}
                      onComplete={isFirstUserAccount ? () => {} : form.handleSubmit(onSubmit)}
                      type={isFirstUserAccount ? 'default' : 'pin'}
                    />
                  </FormControl>
                  <FormMessage className={cn('text-p')} />
                  {isFirstUserAccount && (
                    <FormDescription className={cn('text-p')}>
                      {t('usersettings.security.safePinDescription')}
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />
          </div>
        )}
      </form>
    </Form>
  );

  const getFooter = () =>
    enterSafePin ? (
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <DialogFooterButtons
          handleClose={() => setEnterSafePin(false)}
          cancelButtonText="common.back"
          handleSubmit={() => {}}
          submitButtonType="submit"
          submitButtonText="common.save"
        />
      </form>
    ) : (
      <DialogFooterButtons
        handleClose={handleClose}
        cancelButtonText="common.cancel"
        handleSubmit={() => setEnterSafePin(true)}
        submitButtonText="common.next"
      />
    );

  return (
    <AdaptiveDialog
      body={getDialogBody()}
      footer={getFooter()}
      isOpen={isOpen}
      handleOpenChange={handleClose}
      title={t('usersettings.security.addUserAccount')}
    />
  );
};

export default AddUserAccountDialog;
