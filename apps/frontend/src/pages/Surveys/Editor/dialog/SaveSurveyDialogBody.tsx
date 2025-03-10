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
import { UseFormReturn } from 'react-hook-form';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import Checkbox from '@/components/ui/Checkbox';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useGroupStore from '@/store/GroupStore';
import DatetimePickerHourCycle from '@/components/ui/DatetimePickerHourCycle';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

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

  const checkboxOptions: { name: keyof SurveyDto; label: string }[] = [
    { name: 'isAnonymous', label: 'surveys.saveDialog.isAnonymous' },
    { name: 'isPublic', label: 'surveys.saveDialog.isPublic' },
    { name: 'canSubmitMultipleAnswers', label: 'surveys.saveDialog.canSubmitMultipleAnswers' },
    { name: 'canUpdateFormerAnswer', label: 'surveys.saveDialog.canUpdateFormerAnswer' },
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
      <div>
        <DatetimePickerHourCycle
          value={form.watch('expires')}
          onChange={(value) => form.setValue('expires', value)}
          translationId="survey.expirationDate"
          minDate={new Date()}
          variant="dialog"
        />
      </div>
      <p className="text-m font-bold text-background">{t('surveys.saveDialog.settingsFlags')}</p>
      {checkboxOptions.map(({ name, label }) => (
        <Checkbox
          key={name}
          label={t(label)}
          checked={Boolean(watch(name))}
          onCheckedChange={(value: boolean) => setValue(name, value, { shouldValidate: true })}
          aria-label={t(`survey.${name}`)}
          className="text-background"
        />
      ))}
    </>
  );
};

export default SaveSurveyDialogBody;
