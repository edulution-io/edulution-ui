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
