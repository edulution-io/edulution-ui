import React from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import cn from '@/lib/utils';
import AttendeeDto from '@libs/conferences/types/attendee.dto';
import MultipleSelectorGroup from '@libs/user/types/groups/multipleSelectorGroup';
import useUserStore from '@/store/UserStore/UserStore';
import Input from '@/components/shared/Input';
import DatePicker from '@/components/shared/DatePicker';
import Checkbox from '@/components/ui/Checkbox';
import CircleLoader from '@/components/ui/CircleLoader';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SaveSurveyDialogBody = (props: EditSurveyDialogBodyProps) => {
  const {
    form, // saveSurveyLocally
  } = props;
  const { setValue, getValues, watch } = form;
  const { username } = useUserStore();
  const { isLoading, searchAttendees, searchGroups, getGroupMembers, isGetGroupMembersLoading } =
    useCreateConferenceDialogStore();
  const { t } = useTranslation();

  if (isLoading) return <CircleLoader className="mx-auto" />;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    return result.filter((r) => r.username !== username);
  };

  const handleGroupsChange = async (groups: MultipleSelectorOptionSH[]) => {
    const selectedGroups = getValues('invitedGroups') as MultipleSelectorGroup[];

    const newlySelectedGroups = groups.filter((g) => !selectedGroups.some((sg) => sg.id === g.id));

    if (newlySelectedGroups.length > 0 && newlySelectedGroups[0].path) {
      const groupMembers = await getGroupMembers(newlySelectedGroups[0].path as string);
      const attendees = getValues('invitedAttendees') as AttendeeDto[];

      const combinedAttendees = [...groupMembers, ...attendees];

      const uniqueAttendeesMap = new Map(combinedAttendees.map((a) => [a.username, a]));
      const uniqueAttendees = Array.from(uniqueAttendeesMap.values());

      uniqueAttendees.sort((a, b) => a.username.localeCompare(b.username));

      const newlyAddedAttendeesCount = groupMembers.filter(
        (member) => !attendees.some((attendee) => attendee.username === member.username),
      ).length;

      setValue('invitedAttendees', uniqueAttendees, { shouldValidate: true });

      toast.success(t('search.usersAdded', { count: newlyAddedAttendeesCount }));
    }

    setValue('invitedGroups', groups);
  };

  const expirationDateWatched = watch('expirationDate') as Date;
  const expirationTimeWatched = watch('expirationTime') as string[];
  const isAnonymousWatched = watch('isAnonymous') as boolean;
  const canSubmitMultipleAnswersWatched = watch('canSubmitMultipleAnswers') as boolean;

  return (
    <>
      <SearchUsersOrGroups
        users={watch('participants') as AttendeeDto[]}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        isGetGroupMembersLoading={isGetGroupMembersLoading}
      />

      <p className={cn('text-m font-bold', 'text-black')}>{t('survey.expirationDate')}</p>
      <div className="flex items-center text-black">
        {t('common.date')}
        <div className="ml-2">
          <DatePicker
            selected={expirationDateWatched}
            onSelect={(value: Date | undefined) => setValue('expirationDate', value, { shouldValidate: true })}
          />
        </div>
      </div>
      <div className="flex items-center text-black">
        {t('common.time')}
        <Input
          type="time"
          value={expirationTimeWatched}
          onChange={(e) => setValue('expirationTime', e.target.value, { shouldValidate: true })}
          className="ml-2"
        />
      </div>
      <p className={cn('text-m font-bold', 'text-black')}>{t('surveys.saveDialog.flags')}</p>
      <div className="flex items-center text-black">
        <Checkbox
          checked={isAnonymousWatched}
          onCheckedChange={(value: boolean) => setValue('isAnonymous', value, { shouldValidate: true })}
          aria-label={`${t('survey.isAnonymous')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.isAnonymous')}
      </div>
      <div className="flex items-center text-black">
        <Checkbox
          checked={canSubmitMultipleAnswersWatched}
          onCheckedChange={(value: boolean) => setValue('canSubmitMultipleAnswers', value, { shouldValidate: true })}
          aria-label={`${t('survey.canSubmitMultipleAnswers')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.canSubmitMultipleAnswers')}
      </div>
    </>
  );
};

export default SaveSurveyDialogBody;
