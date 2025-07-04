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
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useUserStore from '@/store/UserStore/useUserStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useClassManagementStore from '@/pages/ClassManagement/useClassManagementStore';
import GroupForm from '@libs/groups/types/groupForm';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import GroupPropertiesTable from '@/pages/ClassManagement/components/GroupDialog/GroupPropertiesTable';
import UserGroups from '@libs/groups/types/userGroups.enum';
import useGroupStore from '@/store/GroupStore';
import useLessonStore from '@/pages/ClassManagement/LessonPage/useLessonStore';

interface GroupDialogBodyProps {
  form: UseFormReturn<GroupForm>;
  type: UserGroups;
  isCreateMode: boolean;
  disabled?: boolean;
}

const GroupDialogBody = ({ form, type, isCreateMode, disabled }: GroupDialogBodyProps) => {
  const { setValue, watch, getValues } = form;
  const { user, searchAttendees } = useUserStore();
  const { searchGroups, searchGroupsIsLoading } = useGroupStore();
  const { isSessionLoading, isSchoolClassLoading, isProjectLoading } = useClassManagementStore();
  const { userGroupToEdit } = useLessonStore();
  const { t } = useTranslation();

  const isDialogLoading = isProjectLoading || isSchoolClassLoading || isSessionLoading;
  if (isDialogLoading) return <CircleLoader className="mx-auto" />;

  const handleAdminUsersChange = (attendees: AttendeeDto[]) => {
    setValue('admins', attendees, { shouldValidate: true });
  };

  const handleStandardUsersChange = (attendees: AttendeeDto[]) => {
    setValue('members', attendees, { shouldValidate: true });
  };

  const onUsersSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user?.username);
  };

  const handleAdminGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue('admingroups', groups, { shouldValidate: true });
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue('membergroups', groups, { shouldValidate: true });
  };

  const displayName = watch('displayName');

  useEffect(() => {
    if (!isCreateMode) {
      return;
    }

    const sanitizedName = displayName
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_+-]/g, '');

    setValue('name', sanitizedName);
  }, [displayName, setValue]);

  const adminUsers = watch('admins');
  const adminGroups = watch('admingroups');
  const standardUsers = watch('members');
  const standardGroups = watch('membergroups');

  const adminsAccordionTitle = `${t('common.groupAdmins')}: ${adminUsers.length} ${t('common.users')} ${t('common.and')} ${adminGroups.length} ${t('common.groups')}`;
  const standardGroupsAccordionTitle = `${t('common.and')} ${standardGroups.length} ${t('common.groups')}`;
  const standardUsersAccordionTitle = `${t('common.groupUsers')}: ${standardUsers.length} ${t('common.users')} ${type === UserGroups.Sessions ? '' : standardGroupsAccordionTitle}`;

  const isNameChangeDisabled = type === UserGroups.Sessions && userGroupToEdit !== null;

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <FormField
          name="displayName"
          disabled={isNameChangeDisabled || disabled}
          form={form}
          defaultValue={getValues('displayName')}
          labelTranslationId={t('classmanagement.name')}
          isLoading={searchGroupsIsLoading}
          variant="dialog"
        />

        <AccordionSH type="multiple">
          {type !== UserGroups.Sessions ? (
            <AccordionItem value="properties">
              <AccordionTrigger className="w-full text-start text-lg font-bold text-background">
                {t('common.properties')}
              </AccordionTrigger>
              <AccordionContent className="overflow-auto">
                <GroupPropertiesTable
                  isCreateMode={isCreateMode}
                  disabled={disabled}
                  form={form}
                />
              </AccordionContent>
            </AccordionItem>
          ) : null}

          {type === UserGroups.Projects ? (
            <AccordionItem value="addAdmins">
              <AccordionTrigger className="w-full text-start text-lg font-bold text-background">
                {adminsAccordionTitle}
              </AccordionTrigger>
              <AccordionContent className="overflow-auto">
                <SearchUsersOrGroups
                  users={adminUsers}
                  onSearch={onUsersSearch}
                  onUserChange={handleAdminUsersChange}
                  groups={adminGroups}
                  onGroupSearch={searchGroups}
                  onGroupsChange={handleAdminGroupsChange}
                  disabled={disabled}
                  variant="dialog"
                />
                <div className="h-16 w-16" />
              </AccordionContent>
            </AccordionItem>
          ) : null}

          <AccordionItem value="addUsers">
            <AccordionTrigger className="w-full text-start text-lg font-bold text-background">
              {standardUsersAccordionTitle}
            </AccordionTrigger>
            <AccordionContent className="overflow-auto">
              <SearchUsersOrGroups
                users={standardUsers}
                onSearch={onUsersSearch}
                onUserChange={handleStandardUsersChange}
                groups={standardGroups}
                onGroupSearch={searchGroups}
                onGroupsChange={handleGroupsChange}
                disabled={disabled}
                hideGroupSearch={type === UserGroups.Sessions}
                variant="dialog"
              />
              <div className="h-24 w-16" />
            </AccordionContent>
          </AccordionItem>
        </AccordionSH>
      </form>
    </Form>
  );
};

export default GroupDialogBody;
