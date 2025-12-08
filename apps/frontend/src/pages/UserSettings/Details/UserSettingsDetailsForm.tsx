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
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useLmnApiStore from '@/store/useLmnApiStore';
import BadgeFormField from '@/components/shared/BadgeFormField';
import FormField from '@/components/shared/FormField';
import { Button } from '@/components/shared/Button';
import { Form } from '@/components/ui/Form';
import InputProp from '@/types/input-prop';
import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';

const UserSettingsDetailsForm = () => {
  const { user, patchUserDetails } = useLmnApiStore();

  const { t } = useTranslation();

  // TODO: NIEDUUI-417: Make this dynamic using the user object
  let userDataFields: Array<InputProp<string> | InputProp<number> | InputProp<boolean>> = [];
  if (user?.sophomorixRole === SOPHOMORIX_GROUP_TYPES.TEACHER) {
    userDataFields = [
      {
        type: 'text',
        name: 'sophomorixCustom1',
        label: t('usersettings.details.sophomorixCustom1_teacher'),
        value: user?.sophomorixCustom1 || '',
      },
      {
        type: 'text',
        name: 'sophomorixCustom2',
        label: t('usersettings.details.sophomorixCustom2_teacher'),
        value: user?.sophomorixCustom2 || '',
      },
    ];
  }

  // TODO: NIEDUUI-417: Make this dynamic using the user object
  let userDataMultiFields: Array<InputProp<string[]>> = [];
  if (user?.sophomorixRole === SOPHOMORIX_GROUP_TYPES.TEACHER) {
    userDataMultiFields = [
      {
        type: 'badges',
        name: 'sophomorixCustomMulti1',
        label: t('usersettings.details.sophomorixCustomMulti1_teacher'),
        value: user?.sophomorixCustomMulti1 || [],
      },
    ];
  }

  const form = useForm({
    defaultValues: {
      proxyAddresses: user?.proxyAddresses || [],
      ...userDataFields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {}),
      ...userDataMultiFields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {}),
    },
  });

  if (!user?.name) return null;
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => patchUserDetails(data))}>
        <div className="space-y-4 md:max-w-[75%]">
          <BadgeFormField
            form={form}
            name="proxyAddresses"
            labelTranslationId="usersettings.details.proxyAddresses"
            placeholder={t('usersettings.details.addNew')}
          />
          {userDataFields.map((field: InputProp<string> | InputProp<number> | InputProp<boolean>) => (
            <FormField
              form={form}
              key={field.name}
              type={field.type}
              name={field.name}
              labelTranslationId={field.label}
              defaultValue={field.value}
            />
          ))}
          {userDataMultiFields.map((field: InputProp<string[]>) => (
            <BadgeFormField
              form={form}
              key={field.name}
              name={field.name || field.label}
              labelTranslationId={field.label}
              placeholder={t('common.add')}
            />
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="btn-security"
            size="lg"
            type="submit"
          >
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UserSettingsDetailsForm;
