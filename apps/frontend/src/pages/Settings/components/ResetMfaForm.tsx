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
