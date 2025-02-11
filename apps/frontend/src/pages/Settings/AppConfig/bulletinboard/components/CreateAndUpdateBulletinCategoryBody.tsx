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

import NameInputWithAvailability from '@/pages/BulletinBoard/components/NameInputWithAvailability';
import DialogSwitch from '@/components/shared/DialogSwitch';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import AttendeeDto from '@libs/user/types/attendee.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import { Form } from '@/components/ui/Form';
import React from 'react';
import MultipleSelectorOptionSH from '@libs/ui/types/multipleSelectorOptionSH';
import { UseFormReturn } from 'react-hook-form';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/UserStore';
import useGroupStore from '@/store/GroupStore';

interface CreateAndUpdateBulletinCategoryBodyProps {
  handleFormSubmit: (e: React.FormEvent) => void;
  form: UseFormReturn<CreateBulletinCategoryDto>;
  isCurrentNameEqualToSelected: () => boolean;
}

const CreateAndUpdateBulletinCategoryBody = ({
  handleFormSubmit,
  form,
  isCurrentNameEqualToSelected,
}: CreateAndUpdateBulletinCategoryBodyProps) => {
  const { t } = useTranslation();
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();

  const { setValue, watch } = form;

  const handleVisibleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('visibleForUsers', attendees, { shouldValidate: true });
  };

  const handleEditableAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('editableByUsers', attendees, { shouldValidate: true });
  };

  const handleNameChange = (newName: string) => {
    setValue('name', newName, { shouldValidate: true });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <p>{t('bulletinboard.categoryName')}:</p>
          <NameInputWithAvailability
            register={form.register('name')}
            placeholder={t('bulletinboard.categoryName')}
            onValueChange={handleNameChange}
            shouldAvailabilityStatusShow={form.formState.isValid && !isCurrentNameEqualToSelected()}
          />
        </div>

        <DialogSwitch
          translationId="bulletinboard.isActive"
          checked={watch('isActive')}
          onCheckedChange={(isChecked) => {
            form.setValue('isActive', isChecked);
          }}
        />
        <p className="pt-4 text-lg font-bold text-background">
          {t('bulletinboard.categories.visibleByUsersAndGroupsTitle')}
        </p>
        <p className="text-background">{t('bulletinboard.categories.visibleByUsersAndGroups')}:</p>
        <SearchUsersOrGroups
          users={watch('visibleForUsers') as AttendeeDto[]}
          onSearch={searchAttendees}
          onUserChange={handleVisibleAttendeesChange}
          groups={watch('visibleForGroups') as MultipleSelectorGroup[]}
          onGroupSearch={searchGroups}
          onGroupsChange={(groups) => setValue('visibleForGroups', groups, { shouldValidate: true })}
          variant="dialog"
        />
        <p className="pt-4 text-lg font-bold text-background">
          {t('bulletinboard.categories.editableByUsersAndGroupsTitle')}
        </p>
        <p className="text-background">{t('bulletinboard.categories.editableByUsersAndGroups')}:</p>
        <SearchUsersOrGroups
          users={watch('editableByUsers') as AttendeeDto[]}
          onSearch={searchAttendees}
          onUserChange={handleEditableAttendeesChange}
          groups={watch('editableByGroups') as MultipleSelectorGroup[]}
          onGroupSearch={searchGroups}
          onGroupsChange={(groups) => setValue('editableByGroups', groups, { shouldValidate: true })}
          variant="dialog"
        />
      </form>
    </Form>
  );
};

export default CreateAndUpdateBulletinCategoryBody;
