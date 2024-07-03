import React from 'react';
// import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import cn from '@/lib/utils';
// import AttendeeDto from '@libs/conferences/types/attendee.dto';
// import useUserStore from '@/store/UserStore/UserStore';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/shared/Input';
import DatePicker from '@/components/shared/DatePicker';
// import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
// import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
// import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
// import Group from '@/pages/ConferencePage/dto/group';

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const SaveSurveyDialogBody = (props: EditSurveyDialogBodyProps) => {
  const {
    form, // saveSurveyLocally
  } = props;
  const { setValue, /* getValues, */ watch } = form;

  // const { user } = useUserStore();
  // const { /* searchGroups, getGroupMembers, */ searchAttendees /* isGetGroupMembersLoading */ } =
  //   useCreateConferenceDialogStore();

  const { t } = useTranslation();

  // const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
  //   setValue('participants', attendees, { shouldValidate: true });
  // };
  //
  // const onAttendeesSearch = async (value: string): Promise<AttendeeDto[]> => {
  //   const result = await searchAttendees(value);
  //   return result.filter((r) => r.username !== user?.preferred_username);
  // };
  //
  // // TODO: NIEDUUI-282 - Activate group search and selection
  // // const handleGroupsChange = async (groups: MultipleSelectorOptionSH[]) => {
  // //   const selectedGroups = getValues('invitedGroups') as Group[];
  // //
  // //   const newlySelectedGroups = groups.filter((g) => !selectedGroups.some((sg) => sg.id === g.id));
  // //
  // //   if (newlySelectedGroups.length > 0 && newlySelectedGroups[0].path) {
  // //     const groupMembers = await getGroupMembers(newlySelectedGroups[0].path as string);
  // //     const attendees = getValues('participants') as AttendeeDto[];
  // //
  // //     const combinedAttendees = [...groupMembers, ...attendees];
  // //
  // //     const uniqueAttendeesMap = new Map(combinedAttendees.map((a) => [a.username, a]));
  // //     const uniqueAttendees = Array.from(uniqueAttendeesMap.values());
  // //
  // //     uniqueAttendees.sort((a, b) => a.username.localeCompare(b.username));
  // //
  // //     const newlyAddedAttendeesCount = groupMembers.filter(
  // //       (member) => !attendees.some((attendee) => attendee.username === member.username),
  // //     ).length;
  // //
  // //     setValue('participants', uniqueAttendees, { shouldValidate: true });
  // //
  // //     toast.success(t('search.usersAdded', { count: newlyAddedAttendeesCount }));
  // //   }
  // //
  // //   setValue('invitedGroups', groups);
  // // };
  //
  // // const participantsWatched = watch('participants') as AttendeeDto[];
  // const participantsValue = getValues('participants') as AttendeeDto[];

  const expirationDateWatched = watch('expirationDate') as Date;
  const expirationTimeWatched = watch('expirationTime') as string[];
  const isAnonymousWatched = watch('isAnonymous') as boolean;
  const canSubmitMultipleAnswersWatched = watch('canSubmitMultipleAnswers') as boolean;

  return (
    <>
      {/* <SearchUsersOrGroups */}
      {/*  users={participantsValue} */}
      {/*  onSearch={onAttendeesSearch} */}
      {/*  onUserChange={handleAttendeesChange} */}
      {/*  // TODO: NIEDUUI-282 - Activate group search and selection */}
      {/*  // groups={watch('invitedGroups')} */}
      {/*  // onGroupSearch={searchGroups} */}
      {/*  // onGroupsChange={handleGroupsChange} */}
      {/*  // isGetGroupMembersLoading={isGetGroupMembersLoading} */}
      {/* /> */}

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
