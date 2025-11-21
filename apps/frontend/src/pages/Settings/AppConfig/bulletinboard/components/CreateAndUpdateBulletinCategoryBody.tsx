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

import NameInputWithAvailability from '@/pages/BulletinBoard/components/NameInputWithAvailability';
import DialogSwitch from '@/components/shared/DialogSwitch';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { Form } from '@/components/ui/Form';
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import CreateBulletinCategoryDto from '@libs/bulletinBoard/types/createBulletinCategoryDto';
import { useTranslation } from 'react-i18next';
import useUserStore from '@/store/UserStore/useUserStore';
import useGroupStore from '@/store/GroupStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import { DropdownSelect } from '@/components';
import BulletinVisibilityStatesType from '@libs/bulletinBoard/types/bulletinVisibilityStatesType';
import BULLETIN_VISIBILITY_STATES from '@libs/bulletinBoard/constants/bulletinVisibilityStates';

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

  const handleVisibleAttendeesChange = (attendees: AttendeeDto[]) => {
    setValue('visibleForUsers', attendees, { shouldValidate: true });
  };

  const handleEditableAttendeesChange = (attendees: AttendeeDto[]) => {
    setValue('editableByUsers', attendees, { shouldValidate: true });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('name', e.target.value, { shouldValidate: true });
  };

  const handleVisibilityStateChange = (visibilityState: string) => {
    form.setValue('bulletinVisibility', BULLETIN_VISIBILITY_STATES[visibilityState as BulletinVisibilityStatesType]);
  };

  const bulletinVisibilityOptions = Object.keys(BULLETIN_VISIBILITY_STATES).map((s) => ({
    name: t(`bulletinboard.categories.${s}`),
    id: BULLETIN_VISIBILITY_STATES[s as BulletinVisibilityStatesType],
  }));

  return (
    <Form {...form}>
      <form
        onSubmit={handleFormSubmit}
        className="space-y-4"
      >
        <div className="flex items-center space-x-2">
          <NameInputWithAvailability
            form={form}
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

        <div className="mb-1 font-bold">{t('bulletinboard.categories.visibilityState')}</div>
        <DropdownSelect
          options={bulletinVisibilityOptions}
          selectedVal={watch('bulletinVisibility') || BULLETIN_VISIBILITY_STATES.FULLY_VISIBLE}
          handleChange={handleVisibilityStateChange}
          variant="dialog"
          searchEnabled={false}
        />

        <p className="pt-4 text-lg font-bold text-background">
          {t('bulletinboard.categories.visibleByUsersAndGroupsTitle')}
        </p>
        <p className="text-background">{t('bulletinboard.categories.visibleByUsersAndGroups')}:</p>
        <SearchUsersOrGroups
          users={watch('visibleForUsers')}
          onSearch={searchAttendees}
          onUserChange={handleVisibleAttendeesChange}
          groups={watch('visibleForGroups')}
          onGroupSearch={searchGroups}
          onGroupsChange={(groups) => setValue('visibleForGroups', groups, { shouldValidate: true })}
          variant="dialog"
        />
        <p className="pt-4 text-lg font-bold text-background">
          {t('bulletinboard.categories.editableByUsersAndGroupsTitle')}
        </p>
        <p className="text-background">{t('bulletinboard.categories.editableByUsersAndGroups')}:</p>
        <SearchUsersOrGroups
          users={watch('editableByUsers')}
          onSearch={searchAttendees}
          onUserChange={handleEditableAttendeesChange}
          groups={watch('editableByGroups')}
          onGroupSearch={searchGroups}
          onGroupsChange={(groups) => setValue('editableByGroups', groups, { shouldValidate: true })}
          variant="dialog"
        />
      </form>
    </Form>
  );
};

export default CreateAndUpdateBulletinCategoryBody;
