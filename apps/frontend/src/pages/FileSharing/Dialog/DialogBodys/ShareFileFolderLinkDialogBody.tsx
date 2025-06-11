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
import FILE_LINK_EXPIRY_VALUES from '@libs/filesharing/constants/fileLinkExpiryValues';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import DropdownMenu from '@/components/shared/DropdownMenu';
import DropdownMenuItemType from '@libs/ui/types/dropdownMenuItemType';
import { Button } from '@/components/shared/Button';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PublicShareFilesDialogProps } from '@libs/filesharing/types/publicShareFilesDialogProps';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import SHARE_WITH from '@libs/filesharing/constants/shareWith';
import FormField from '@/components/shared/FormField';
import { FormProvider } from 'react-hook-form';

const ShareFileFolderLinkDialogBody: React.FC<PublicShareFilesDialogProps> = ({ form }) => {
  const { t } = useTranslation();
  const { setValue, watch, getValues } = form;
  const { selectedItems } = useFileSharingStore();
  const currentExpiry = form.watch('expires');
  const { user, searchAttendees } = useUserStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();

  const handleAttendeesChange = (attendees: AttendeeDto[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user?.username);
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue('invitedGroups', groups, { shouldValidate: true });
  };

  const handleSelectExpiry = (value: (typeof FILE_LINK_EXPIRY_VALUES)[number]) => {
    form.setValue('expires', value, { shouldDirty: true, shouldValidate: true });
  };

  const expiryItems: DropdownMenuItemType[] = FILE_LINK_EXPIRY_VALUES.map((value) => ({
    label: t(`filesharing.expiry.${value}`),
    isCheckbox: true,
    checked: currentExpiry === value,
    onCheckedChange: () => handleSelectExpiry(value),
  }));

  const displayLabel = currentExpiry ? t(`filesharing.expiry.${currentExpiry}`) : t('filesharing.expiry.select');

  const invitedAttendees = watch('invitedAttendees') || [];
  const invitedGroups = watch('invitedGroups') || [];

  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-[25rem] text-muted-foreground">
        {selectedItems.length ? (
          <>
            {t('filesharing.expiry.selectedItemPrefix')}
            <span className="block truncate">{selectedItems[0].filename}</span>
          </>
        ) : null}
      </p>
      <AccordionSH type="multiple">
        <AccordionItem value={SHARE_WITH}>
          <AccordionTrigger className="flex text-h4">
            <p>{t('filesharing.publicFileSharing.selectPersonsOrGroupsWhoCanAccess')}</p>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 px-1">
            <SearchUsersOrGroups
              users={invitedAttendees}
              onSearch={onAttendeesSearch}
              onUserChange={handleAttendeesChange}
              groups={invitedGroups}
              onGroupSearch={searchGroups}
              onGroupsChange={handleGroupsChange}
              variant="dialog"
            />
          </AccordionContent>
        </AccordionItem>
      </AccordionSH>

      <div className="flex items-center gap-2">
        <span className="font-medium text-background">{t('filesharing.expiry.select')}</span>
        <DropdownMenu
          trigger={
            <Button
              type="button"
              variant="btn-small"
              className="w-full justify-between bg-muted text-secondary"
              title={t('filesharing.tooltips.expiry')}
            >
              {displayLabel} <ChevronDown className="ml-1 h-4 w-4" />
            </Button>
          }
          items={expiryItems}
          menuContentClassName="min-w-[10rem]"
        />
      </div>
      <FormProvider {...form}>
        <FormField
          name="password"
          defaultValue={getValues('password')}
          form={form}
          labelTranslationId={t('conferences.password')}
          type="password"
          disabled={searchGroupsIsLoading}
          variant="dialog"
        />
      </FormProvider>

      {invitedAttendees.length > 0 || invitedGroups.length > 0 ? (
        <p className="text-muted-foreground">{t('filesharing.expiry.inviteesWarning')}</p>
      ) : (
        <p className="text-muted-foreground">{t('filesharing.expiry.noInviteesWarning')}</p>
      )}
    </div>
  );
};

export default ShareFileFolderLinkDialogBody;
