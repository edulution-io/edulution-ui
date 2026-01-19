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
import { UseFormReturn } from 'react-hook-form';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';
import useUserStore from '@/store/UserStore/useUserStore';
import useGroupStore from '@/store/GroupStore';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import Checkbox from '@/components/ui/Checkbox';
import DateTimePickerField from '@/components/ui/DateTimePicker/DateTimePickerField';

interface SaveSurveyDialogBodyProps {
  form: UseFormReturn<SurveyDto>;
}

const SaveSurveyDialogBody = ({ form }: SaveSurveyDialogBodyProps) => {
  const { setValue, watch } = form;
  const { user } = useUserStore();
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();
  const { t } = useTranslation();

  const handleAttendeesChange = (attendees: AttendeeDto[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return user ? result.filter((r) => r.username !== user.username) : result;
  };

  const handleGroupsChange = (groups: MultipleSelectorGroup[]) => {
    setValue('invitedGroups', groups, { shouldValidate: true });
  };

  const checkboxOptions: { name: keyof SurveyDto; label: string; shouldDisable?: boolean }[] = [
    { name: 'isAnonymous', label: 'surveys.saveDialog.isAnonymous' },
    { name: 'isPublic', label: 'surveys.saveDialog.isPublic' },
    {
      name: 'canSubmitMultipleAnswers',
      label: 'surveys.saveDialog.canSubmitMultipleAnswers',
      shouldDisable: !!watch('canUpdateFormerAnswer'),
    },
    {
      name: 'canUpdateFormerAnswer',
      label: 'surveys.saveDialog.canUpdateFormerAnswer',
      shouldDisable: !!watch('canSubmitMultipleAnswers'),
    },
  ];

  return (
    <>
      <SearchUsersOrGroups
        users={watch('invitedAttendees')}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups')}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        variant="dialog"
      />
      <DateTimePickerField
        form={form}
        path="expires"
        translationId="survey.expirationDate"
        variant="dialog"
      />
      <p className="text-m font-bold text-background">{t('surveys.saveDialog.settingsFlags')}</p>
      {checkboxOptions.map(({ name, label, shouldDisable }) => (
        <Checkbox
          key={name}
          label={t(label)}
          checked={Boolean(watch(name))}
          onCheckedChange={(value: boolean) => setValue(name, value, { shouldValidate: true })}
          disabled={shouldDisable}
          aria-label={t(`survey.${name}`)}
          className="text-background"
        />
      ))}
    </>
  );
};

export default SaveSurveyDialogBody;
