/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { Button } from '@/components/shared/Button';
import { UseFormReturn } from 'react-hook-form';
import UserPasswordDialogForm from '@libs/classManagement/types/userPasswordDialogForm';
import UseLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import generateRandomString from '@libs/common/utils/generateRandomString';
import FormField from '@/components/shared/FormField';
import { toast } from 'sonner';

interface UserPasswordDialogBodyProps {
  user: LmnUserInfo;
  form: UseFormReturn<UserPasswordDialogForm>;
  updateUser: () => Promise<void>;
}

const UserPasswordDialogBody = ({
  user: { cn: username, FirstPasswordSet: isFirstPasswordSet, sophomorixFirstPassword },
  form,
  updateUser,
}: UserPasswordDialogBodyProps) => {
  const {
    formState: { errors },
    getValues,
    watch,
    setValue,
  } = form;
  const { t } = useTranslation();

  const { setFirstPassword, setCurrentPassword } = UseLmnApiPasswordStore();

  const onSaveCurrentPasswordClick = async () => {
    await setCurrentPassword(username, getValues('currentPassword'));
    await updateUser();
  };

  const onSaveFirstPasswordClick = async () => {
    setValue('currentPassword', '');
    await setFirstPassword(username, getValues('firstPassword'));
    await updateUser();
  };

  const onGenerateFirstPasswordClick = async () => {
    setValue('currentPassword', '');
    const randomPassword = generateRandomString(8);
    setValue('firstPassword', randomPassword);
    await setFirstPassword(username, randomPassword);
    await updateUser();
  };

  const onRestoreFirstPasswordClick = async () => {
    await updateUser();
    setValue('currentPassword', '');
    if (sophomorixFirstPassword) {
      await setCurrentPassword(username, sophomorixFirstPassword);
    } else {
      toast.success(t('classmanagement.firstPasswordNotSet'));
    }
    await updateUser();
  };

  return (
    <div className="flex flex-col text-base text-background">
      <table className="w-full table-fixed">
        <tbody>
          <tr>
            <td className="w-1/3 border p-2 text-left">{t('loginname')}</td>
            <td className="w-2/3 border p-2">{username}</td>
          </tr>
          <tr>
            <td className="w-1/3 border p-2 text-left">{t('classmanagement.firstPassword')}</td>
            <td className="w-2/3 border p-2">
              <div className="mb-2 flex flex-col items-stretch space-y-2 md:flex-row md:space-y-0">
                <div className="mt-0.5 flex-grow">
                  <FormField
                    name="firstPassword"
                    form={form}
                    type="password"
                    className="w-full flex-grow"
                    value={form.watch('firstPassword')}
                    onChange={(e) => form.setValue('firstPassword', e.target.value)}
                    variant="dialog"
                  />
                </div>
                <Button
                  variant="btn-infrastructure"
                  className="self-end md:ml-2 md:mt-0 md:w-auto"
                  size="lg"
                  onClick={onSaveFirstPasswordClick}
                  disabled={!!errors.firstPassword || !watch('firstPassword').length}
                >
                  {t('common.save')}
                </Button>
              </div>
              <Button
                variant="btn-collaboration"
                className="mt-2 md:mt-0 md:w-auto"
                onClick={onGenerateFirstPasswordClick}
                size="lg"
              >
                {t('classmanagement.setRandom')}
              </Button>
            </td>
          </tr>
          <tr>
            <td className="w-1/3 border p-2 text-left">{t('classmanagement.currentPassword')}</td>
            <td className="w-2/3 border p-2">
              <div className="mb-2 flex flex-col items-stretch space-y-2 md:flex-row md:space-y-0">
                <div className="mt-0.5 flex-grow">
                  <FormField
                    name="currentPassword"
                    form={form}
                    type="password"
                    variant="dialog"
                  />
                </div>
                <Button
                  variant="btn-infrastructure"
                  className="self-end md:ml-2 md:mt-0 md:w-auto"
                  size="lg"
                  onClick={onSaveCurrentPasswordClick}
                  disabled={!!errors.currentPassword || !watch('currentPassword').length}
                >
                  {t('common.save')}
                </Button>
              </div>
              <Button
                variant="btn-collaboration"
                className="mt-2 whitespace-normal md:mt-0 md:w-auto"
                onClick={onRestoreFirstPasswordClick}
                disabled={isFirstPasswordSet}
                size="lg"
              >
                {t('classmanagement.restoreFirstPassword')}
              </Button>
              <div>
                {t(
                  `classmanagement.${isFirstPasswordSet ? 'firstPasswordIsCurrentlySet' : 'firstPasswordIsCurrentlyNotSet'}`,
                )}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserPasswordDialogBody;
