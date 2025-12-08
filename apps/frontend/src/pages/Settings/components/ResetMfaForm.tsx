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
import AsyncMultiSelect from '@/components/shared/AsyncMultiSelect';
import { Form, FormControl, FormFieldSH, FormItem, FormMessage } from '@/components/ui/Form';
import { useForm } from 'react-hook-form';
import useUserStore from '@/store/UserStore/useUserStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

type ResetMfaFormValues = {
  selectedUsers: AttendeeDto[];
};

const ResetMfaForm: React.FC = () => {
  const { t } = useTranslation();
  const { user, searchAttendees, disableTotpForUser } = useUserStore();

  const form = useForm<ResetMfaFormValues>({ defaultValues: { selectedUsers: [] } });

  const { control, handleSubmit, getValues } = form;

  const onUsersSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    const filteredUsers = result.filter((r) => r.username !== user?.username);
    return filteredUsers;
  };

  const onSubmit = async (data: ResetMfaFormValues) => {
    if (!data.selectedUsers || data.selectedUsers.length === 0) {
      return;
    }
    const selectedUsers = data.selectedUsers.map((usr) => usr.username);

    await Promise.all(
      selectedUsers.map(async (usr) => {
        await disableTotpForUser(usr);
        form.setValue(
          'selectedUsers',
          getValues('selectedUsers').filter((attendeeDto) => attendeeDto.username !== usr),
        );
      }),
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormFieldSH
          control={control}
          name="selectedUsers"
          render={() => (
            <FormItem>
              <p className="font-bold">{t('settings.userAdministration.selectUsersTitle')}</p>
              <FormControl>
                <AsyncMultiSelect
                  value={getValues('selectedUsers')}
                  onSearch={onUsersSearch}
                  onChange={(usr) => form.setValue('selectedUsers', usr)}
                  placeholder={t('search.type-to-search')}
                />
              </FormControl>
              <p className="text-background">{t('settings.userAdministration.selectUsersDescription')}</p>
              <FormMessage className="text-p" />
            </FormItem>
          )}
        />
        <DialogFooterButtons
          submitButtonText={t('common.reset')}
          handleSubmit={() => {}}
          submitButtonVariant="btn-security"
          submitButtonType="submit"
        />
      </form>
    </Form>
  );
};

export default ResetMfaForm;
