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

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import FormField from '@/components/shared/FormField';
import useUserStore from '@/store/UserStore/useUserStore';
import useGroupStore from '@/store/GroupStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import CreateOrEditPublicShareDto from '@libs/filesharing/types/createOrEditPublicShareDto';
import ShareLinkScopeSelector from '@/pages/FileSharing/utilities/ShareLinkScopeSelector';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import PUBLIC_SHARE_LINK_SCOPE from '@libs/filesharing/constants/publicShareLinkScope';

interface CreateOrEditPublicShareDialogBodyProps {
  form: UseFormReturn<CreateOrEditPublicShareDto>;
}

const CreateOrEditPublicShareDialogBody: React.FC<CreateOrEditPublicShareDialogBodyProps> = ({ form }) => {
  const { t } = useTranslation();
  const { user, searchAttendees } = useUserStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();
  const { share } = usePublicShareStore();

  const { watch, setValue } = form;

  const invitedAttendees = watch('invitedAttendees') ?? [];
  const invitedGroups = watch('invitedGroups') ?? [];

  const handleAttendeesChange = (attendees: AttendeeDto[]) =>
    setValue('invitedAttendees', attendees, { shouldValidate: true });

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) =>
    setValue('invitedGroups', groups, { shouldValidate: true });

  const onAttendeesSearch = async (query: string) =>
    (await searchAttendees(query)).filter((u) => u.username !== user?.username);

  const scope = watch('scope');

  useEffect(() => {
    if (scope !== PUBLIC_SHARE_LINK_SCOPE.RESTRICTED) {
      setValue('invitedAttendees', [], { shouldValidate: true, shouldDirty: false });
      setValue('invitedGroups', [], { shouldValidate: true, shouldDirty: false });
    }
  }, [scope, setValue]);

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-4">
        <p className="max-w-[25rem] text-muted-foreground">
          {t('filesharing.expiry.selectedItemPrefix')}
          <span className="block truncate">{share?.filename}</span>
        </p>

        <Controller
          name="scope"
          control={form.control}
          defaultValue={PUBLIC_SHARE_LINK_SCOPE.PUBLIC}
          render={({ field }) => (
            <ShareLinkScopeSelector
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />

        {scope === PUBLIC_SHARE_LINK_SCOPE.RESTRICTED && (
          <SearchUsersOrGroups
            users={invitedAttendees}
            groups={invitedGroups}
            onSearch={onAttendeesSearch}
            onUserChange={handleAttendeesChange}
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

        <form id="public-share-form">
          <FormField
            name="password"
            form={form}
            defaultValue={share.password}
            labelTranslationId={t('common.password')}
            type="password"
            disabled={searchGroupsIsLoading}
            variant="dialog"
          />
        </form>
      </div>
    </FormProvider>
  );
};

export default CreateOrEditPublicShareDialogBody;
