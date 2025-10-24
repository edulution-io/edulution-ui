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

import React, { useEffect, useState } from 'react';
import UseLmnApiPasswordStore from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/useLmnApiPasswordStore';
import { useTranslation } from 'react-i18next';
import UserPasswordDialogForm from '@libs/classManagement/types/userPasswordDialogForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import UserPasswordDialogBody from '@/pages/ClassManagement/LessonPage/UserArea/UserPasswordDialog/UserPasswordDialogBody';
import useLmnApiStore from '@/store/useLmnApiStore';
import type LmnUserInfo from '@libs/lmnApi/types/lmnUserInfo';
import { Form } from '@/components/ui/Form';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const UserPasswordDialog = () => {
  const { t } = useTranslation();

  const { isLoading, setCurrentUser, currentUser } = UseLmnApiPasswordStore();
  const { isFetchUserLoading, fetchUser } = useLmnApiStore();
  const [user, setUser] = useState<LmnUserInfo | null>(null);

  const initialFormValues: UserPasswordDialogForm = {
    currentPassword: '',
    firstPassword: '',
  };

  const passwordValidationSchema = z
    .string()
    .min(7, { message: t('common.min_chars', { count: 7 }) })
    .max(60, { message: t('common.max_chars', { count: 60 }) })
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[\d\W]).*$/, { message: t('classmanagement.passwordRequirements') });

  const formSchema = z.object({
    firstPassword: passwordValidationSchema,
    currentPassword: passwordValidationSchema,
  });

  const form = useForm<UserPasswordDialogForm>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const updateUser = async () => {
    if (currentUser?.cn) {
      const result = await fetchUser(currentUser?.cn, true);
      if (result) {
        setUser(result);
      }
    }
  };

  useEffect(() => {
    void updateUser();
  }, [currentUser]);

  useEffect(() => {
    if (user?.sophomorixFirstPassword) {
      form.setValue('firstPassword', user.sophomorixFirstPassword);
    }
  }, [user]);

  const onClose = () => {
    setCurrentUser(null);
    setUser(null);
    form.reset();
  };

  const getDialogBody = () => {
    if (!user || isLoading || isFetchUserLoading) return <CircleLoader className="mx-auto" />;
    return (
      <Form {...form}>
        <UserPasswordDialogBody
          user={user}
          form={form}
          updateUser={updateUser}
        />
      </Form>
    );
  };

  const getFooter = () => <DialogFooterButtons handleClose={onClose} />;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div onClick={(e) => e.stopPropagation()}>
      <AdaptiveDialog
        isOpen
        handleOpenChange={onClose}
        title={t('classmanagement.userPasswordDialogTitle', { displayName: user?.displayName })}
        desktopContentClassName="max-w-4xl"
        body={getDialogBody()}
        footer={getFooter()}
      />
    </div>
  );
};

export default UserPasswordDialog;
