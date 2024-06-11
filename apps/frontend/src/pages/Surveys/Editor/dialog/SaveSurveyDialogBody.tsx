import React from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import Checkbox from '@/components/ui/Checkbox';
import DatePicker from '@/components/shared/DatePicker';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import useUserStore from '@/store/userStore';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import Group from '@/pages/ConferencePage/dto/group';
import cn from "@/lib/utils";
import Input from "@/components/shared/Input";

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SaveSurveyDialogBody = (props: EditSurveyDialogBodyProps) => {
  const {
    form, // saveSurveyLocally
  } = props;
  const { setValue, getValues, watch } = form;

  const { user } = useUserStore();
  const { searchGroups, getGroupMembers, searchAttendees, isGetGroupMembersLoading } = useCreateConferenceDialogStore();

  const { t } = useTranslation();

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('participants', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<Attendee[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== user);
  };

  const handleGroupsChange = async (groups: MultipleSelectorOptionSH[]) => {
    const selectedGroups = getValues('invitedGroups') as Group[];

    const newlySelectedGroups = groups.filter((g) => !selectedGroups.some((sg) => sg.id === g.id));

    if (newlySelectedGroups.length > 0 && newlySelectedGroups[0].path) {
      const groupMembers = await getGroupMembers(newlySelectedGroups[0].path as string);
      const attendees = getValues('participants') as Attendee[];

      const combinedAttendees = [...groupMembers, ...attendees];

      const uniqueAttendeesMap = new Map(combinedAttendees.map((a) => [a.username, a]));
      const uniqueAttendees = Array.from(uniqueAttendeesMap.values());

      uniqueAttendees.sort((a, b) => a.username.localeCompare(b.username));

      const newlyAddedAttendeesCount = groupMembers.filter(
        (member) => !attendees.some((attendee) => attendee.username === member.username),
      ).length;

      setValue('participants', uniqueAttendees, { shouldValidate: true });

      toast.success(t('search.usersAdded', { count: newlyAddedAttendeesCount }));
    }

    setValue('invitedGroups', groups);
  };

  return (
    <>
      <SearchUsersOrGroups
        users={watch('participants')}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups')}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        isGetGroupMembersLoading={isGetGroupMembersLoading}
      />

      <p className={cn('text-m font-bold', 'text-black')}>{t('survey.expirationDate')}</p>
      <div className="text-black flex items-center">
        {t('common.date')}
        {// TODO: WHEN IN DEV BRANCH Create shared DatePicker and pass classnames to it
        }
        <div className="ml-2">
          <DatePicker
            selected={watch('expirationDate')}
            onSelect={(value: Date | undefined) => setValue('expirationDate', value, {shouldValidate: true})}
          />
        </div>
      </div>
      <div className="text-black flex items-center">
        {t('common.time')}
        <Input
          type="time"
          value={watch('expirationTime')}
          onChange={async (e) => setValue('expirationTime', e.target.value, {shouldValidate: true})}
          className="ml-2"
        />
      </div>
      <p className={cn('text-m font-bold', 'text-black')}>{t('surveys.saveDialog.flags')}</p>
      <div className="text-black flex items-center">
        <Checkbox
          checked={watch('isAnonymous')}
          onCheckedChange={async (value: boolean) => setValue('isAnonymous', value, {shouldValidate: true})}
          aria-label={`${t('survey.isAnonymous')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.isAnonymous')}
      </div>
      <div className="text-black flex items-center">
        <Checkbox
          checked={watch('canSubmitMultipleAnswers')}
          onCheckedChange={async (value: boolean) => setValue('canSubmitMultipleAnswers', value, {shouldValidate: true})}
          aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.canSubmitMultipleAnswers')}
      </div>
    </>
  );
};

export default SaveSurveyDialogBody;
