import React, { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import { setHours, setMinutes, getHours, getMinutes } from 'date-fns';
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
  const { form } = props;
  const { setValue, getValues, watch } = form;
  const { user } = useUserStore();
  const { isLoading, searchAttendees, searchGroups, getGroupMembers, isGetGroupMembersLoading } =
    useCreateConferenceDialogStore();
  const { t } = useTranslation();

  const [expirationTime, setExpirationTime] = useState<string>(
    `${getHours(getValues('expires')) || '00'}:${getMinutes(getValues('expires')) || '00'}`,
  );

  if (isLoading) return <CircleLoader className="mx-auto" />;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
  };

  const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
    const result = await searchAttendees(value);
    if (!user) {
      return result;
    }
    return result.filter((r) => r.username !== user.username);
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

  const expiresWatched = watch('expires') as Date;
  const isAnonymousWatched = watch('isAnonymous') as boolean;
  const canSubmitMultipleAnswersWatched = watch('canSubmitMultipleAnswers') as boolean;

  const handleExpirationDateChange = (value: Date | undefined) => {
    setValue('expires', value /* , { shouldValidate: true } */);
  };
  const handleExpirationTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExpirationTime(e.target.value);
    const time = e.target.value.split(':');
    let updateExpiration = getValues('expires') as Date;
    updateExpiration = setHours(updateExpiration, Number(time[0]));
    updateExpiration = setMinutes(updateExpiration, Number(time[1]));
    setValue('expires', updateExpiration);
  };

  return (
    <>
      <SearchUsersOrGroups
        users={watch('invitedAttendees') as AttendeeDto[]}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups') as MultipleSelectorGroup[]}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        isGetGroupMembersLoading={isGetGroupMembersLoading}
      />

      <p className="text-m font-bold text-foreground">{t('survey.expirationDate')}</p>
      <div className="flex items-center text-foreground">
        {t('common.date')}
        <div className="ml-2">
          <DatePicker
            selected={expiresWatched}
            onSelect={handleExpirationDateChange}
          />
        </div>
      </div>
      <div className="flex items-center text-foreground">
        {t('common.time')}
        <Input
          type="time"
          value={expirationTime}
          onChange={handleExpirationTimeChange}
          variant="default"
          className={cn('ml-2', { 'text-gray-300': !expirationTime }, { 'text-foreground': expirationTime })}
          disabled={!getValues('expires')}
        />
      </div>
      <p className="text-m font-bold text-foreground">{t('surveys.saveDialog.settingsFlags')}</p>
      <div className="flex items-center text-foreground">
        <Checkbox
          checked={isAnonymousWatched}
          onCheckedChange={(value: boolean) => setValue('isAnonymous', value, { shouldValidate: true })}
          aria-label={`${t('survey.isAnonymous')}`}
          className="mr-2"
        />
        {t('surveys.saveDialog.isAnonymous')}
      </div>
      <div className="flex items-center text-foreground">
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
