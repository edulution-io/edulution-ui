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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import FormField from '@/components/shared/FormField';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import CreateEditPublicFileShareDto from '@libs/filesharing/types/createEditPublicFileShareDto';
import ShareLinkScopeSelector from '@/pages/FileSharing/utilities/ShareLinkScopeSelector';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';

interface CreateEditNewPublicShareDialogBodyProps {
  form: UseFormReturn<CreateEditPublicFileShareDto>;
}

const CreateEditNewPublicShareDialogBody: React.FC<CreateEditNewPublicShareDialogBodyProps> = ({ form }) => {
  const { t } = useTranslation();
  const { selectedItems } = useFileSharingStore();
  const { user, searchAttendees } = useUserStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();
  const { contentsToShare } = usePublicShareStore();
  const { watch, setValue } = form;

  const currentFile = contentsToShare[0] ?? selectedItems[0];

  const invitedAttendees = watch('invitedAttendees') ?? [];
  const invitedGroups = watch('invitedGroups') ?? [];

  const handleAttendeesChange = (attendee: AttendeeDto[]) =>
    setValue('invitedAttendees', attendee, { shouldValidate: true });

  const handleGroupsChange = (group: MultipleSelectorGroup[]) =>
    setValue('invitedGroups', group, { shouldValidate: true });

  const onAttendeesSearch = async (query: string) =>
    (await searchAttendees(query)).filter((u) => u.username !== user?.username);

  const scope = watch('scope');

  useEffect(() => {
    if (scope !== 'restricted') {
      setValue('invitedAttendees', [], { shouldValidate: true, shouldDirty: false });
      setValue('invitedGroups', [], { shouldValidate: true, shouldDirty: false });
    }
  }, [scope, setValue]);

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[25rem] text-muted-foreground">
        {t('filesharing.expiry.selectedItemPrefix')}
        <span className="block truncate">{currentFile?.filename}</span>
      </p>
      <Controller
        name="scope"
        control={form.control}
        defaultValue="public"
        render={({ field }) => (
          <ShareLinkScopeSelector
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />

      {scope === 'restricted' && (
        <SearchUsersOrGroups
          users={invitedAttendees}
          onSearch={onAttendeesSearch}
          onUserChange={handleAttendeesChange}
          groups={invitedGroups}
          onGroupSearch={searchGroups}
          onGroupsChange={handleGroupsChange}
          variant="dialog"
        />
      )}

      <DateTimePickerField
        form={form}
        path="expires"
        translationId="survey.expirationDate"
        variant="dialog"
        isDateRequired
        allowPast={false}
      />

      <FormProvider {...form}>
        <form id="public-share-form">
          <FormField
            name="password"
            form={form}
            labelTranslationId={t('conferences.password')}
            type="password"
            value={form.watch('password')}
            disabled={searchGroupsIsLoading}
            variant="dialog"
          />
        </form>
      </FormProvider>
    </div>
  );
};

export default CreateEditNewPublicShareDialogBody;
