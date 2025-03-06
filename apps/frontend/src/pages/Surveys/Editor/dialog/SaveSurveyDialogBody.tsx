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
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import Checkbox from '@/components/ui/Checkbox';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useGroupStore from '@/store/GroupStore';
import { DateTimeInput } from '@/components/shared/DateTimePicker/DateTimeInput';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import MultipleSelectorGroup from '@libs/groups/types/multipleSelectorGroup';

interface SaveSurveyDialogBodyProps {
  invitedAttendees: AttendeeDto[];
  setInvitedAttendees: (attendees: AttendeeDto[]) => void;
  invitedGroups: MultipleSelectorGroup[];
  setInvitedGroups: (groups: MultipleSelectorGroup[]) => void;

  expires?: Date;
  setExpires: (date: Date | undefined) => void;
  isAnonymous?: boolean;
  setIsAnonymous: (state: boolean | undefined) => void;
  isPublic?: boolean;
  setIsPublic: (state: boolean | undefined) => void;
  canSubmitMultipleAnswers?: boolean;
  setCanSubmitMultipleAnswers: (state: boolean | undefined) => void;
  canUpdateFormerAnswer?: boolean;
  setCanUpdateFormerAnswer: (state: boolean | undefined) => void;
}

const SaveSurveyDialogBody = (props: SaveSurveyDialogBodyProps) => {
  const {
    invitedAttendees,
    setInvitedAttendees,
    invitedGroups,
    setInvitedGroups,

    expires,
    setExpires,
    isAnonymous,
    setIsAnonymous,
    isPublic,
    setIsPublic,
    canSubmitMultipleAnswers,
    setCanSubmitMultipleAnswers,
    canUpdateFormerAnswer,
    setCanUpdateFormerAnswer,
  } = props;

  const { user } = useUserStore();
  const { searchAttendees } = useUserStore();
  const { searchGroups } = useGroupStore();
  const { t } = useTranslation();

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return user ? result.filter((r) => r.username !== user.username) : result;
  };

  const checkboxOptions: {
    name: keyof SurveyDto;
    label: string;
    getter: boolean | undefined;
    setter: (value: boolean | undefined) => void;
  }[] = [
    { name: 'isAnonymous', label: 'surveys.saveDialog.isAnonymous', getter: isAnonymous, setter: setIsAnonymous },
    { name: 'isPublic', label: 'surveys.saveDialog.isPublic', getter: isPublic, setter: setIsPublic },
    {
      name: 'canSubmitMultipleAnswers',
      label: 'surveys.saveDialog.canSubmitMultipleAnswers',
      getter: canSubmitMultipleAnswers,
      setter: setCanSubmitMultipleAnswers,
    },
    {
      name: 'canUpdateFormerAnswer',
      label: 'surveys.saveDialog.canUpdateFormerAnswer',
      getter: canUpdateFormerAnswer,
      setter: setCanUpdateFormerAnswer,
    },
  ];

  return (
    <>
      <SearchUsersOrGroups
        users={invitedAttendees}
        onSearch={onAttendeesSearch}
        onUserChange={setInvitedAttendees}
        groups={invitedGroups}
        onGroupSearch={searchGroups}
        onGroupsChange={setInvitedGroups}
        variant="dialog"
      />
      <div>
        <p className="text-m font-bold text-background">{t('survey.expirationDate')}</p>
        <DateTimeInput
          value={expires}
          onChange={setExpires}
          variant="dialog"
          className="mt-0 pt-0"
        />
      </div>
      <p className="text-m font-bold text-background">{t('surveys.saveDialog.settingsFlags')}</p>
      {checkboxOptions.map(({ name, label, getter, setter }) => (
        <Checkbox
          key={name}
          label={t(label)}
          checked={Boolean(getter)}
          onCheckedChange={(value: boolean) => setter(value)}
          aria-label={t(`survey.${name}`)}
          className="text-background"
        />
      ))}
    </>
  );
};

export default SaveSurveyDialogBody;
