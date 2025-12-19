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

import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { t } from 'i18next';
import { Button } from '@/components/shared/Button';
import useUserSettingsPageStore from '@/pages/UserSettings/Security/useUserSettingsPageStore';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import FormField from '@/components/shared/FormField';
import { Form } from '@/components/ui/Form';

interface PasswordChangeFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const PasswordChangeForm: FC = () => {
  const form = useForm<PasswordChangeFormInputs>();
  const { handleSubmit, watch, reset, getValues } = form;
  const { changePassword, isLoading } = useUserSettingsPageStore();

  const onSubmit = async () => {
    const success = await changePassword(getValues('currentPassword'), getValues('newPassword'));
    if (success) reset();
  };

  return (
    <div className="pt-5 sm:pt-0">
      <LoadingIndicatorDialog isOpen={isLoading} />
      <Form {...form}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 py-4"
        >
          <div className="space-y-2 md:max-w-[75%]">
            <FormField
              name="currentPassword"
              form={form}
              defaultValue=""
              labelTranslationId="usersettings.security.changePassword.currentPassword"
              type="password"
              rules={{ required: t('usersettings.errors.currentPasswordRequired') }}
            />
            <FormField
              name="newPassword"
              form={form}
              defaultValue=""
              labelTranslationId="usersettings.security.changePassword.newPassword"
              type="password"
              rules={{
                required: t('usersettings.errors.newPasswordRequired'),
                minLength: { value: 8, message: t('usersettings.errors.passwordLength') },
              }}
            />
            <FormField
              name="confirmPassword"
              form={form}
              defaultValue=""
              labelTranslationId="usersettings.security.changePassword.confirmPassword"
              type="password"
              rules={{
                required: t('usersettings.errors.confirmPasswordRequired'),
                validate: (value) => value === watch('newPassword') || t('usersettings.errors.passwordsDoNotMatch'),
              }}
            />
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
      </Form>
    </div>
  );
};

export default PasswordChangeForm;
