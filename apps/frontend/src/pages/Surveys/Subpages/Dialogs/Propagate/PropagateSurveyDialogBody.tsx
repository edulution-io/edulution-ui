import React from 'react';
// import { useTranslation } from 'react-i18next';
import { UseFormReturn } from 'react-hook-form';
import useUserStore from '@/store/userStore';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
// import Checkbox from '@/Components/ui/Checkbox';
// import DatePicker from '@/Components/shared/DatePicker';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import Group from '@/pages/ConferencePage/dto/group';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface EditSurveyDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const PropagateSurveyDialogBody = (props: EditSurveyDialogBodyProps) => {
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

  // const onExpiredDateChange = async (value: Date | undefined) => {
  //   form.setValue('expires', value)
  // }
  //
  // const onIsAnonymousChange = async (value: boolean) => {
  //   form.setValue('isAnonymous', value)
  // }
  //
  // const onCanSubmitMultipleAnswersChange = async (value: boolean) => {
  //   form.setValue('isAnonymous', value)
  // }

  return (
    <>
      {/* TODO: Activate the following fields (they do not update soberly)! */}
      {/*<div>*/}
      {/*  {t('expires')}*/}
      {/*  <DatePicker*/}
      {/*    selected={form.getValues('expires')}*/}
      {/*    onSelect={onExpiredDateChange}*/}
      {/*  />*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*  {t('survey.isAnonymous')}*/}
      {/*  <Checkbox*/}
      {/*    checked={form.getValues('isAnonymous')}*/}
      {/*    // onClick={(e) => e.stopPropagation()}*/}
      {/*    onCheckedChange={onIsAnonymousChange}*/}
      {/*    aria-label={`${t('survey.isAnonymous')}`}*/}
      {/*  />*/}
      {/*</div>*/}
      {/*<div>*/}
      {/*  {t('survey.canSubmitMultipleAnswers')}*/}
      {/*  <Checkbox*/}
      {/*    checked={form.getValues('canSubmitMultipleAnswers')}*/}
      {/*    // onClick={(e) => e.stopPropagation()}*/}
      {/*    onCheckedChange={onCanSubmitMultipleAnswersChange}*/}
      {/*    aria-label={`${t('survey.canSubmitMultipleAnswers')}`}*/}
      {/*  />*/}
      {/*</div>*/}
      <SearchUsersOrGroups
        users={watch('participants')}
        onSearch={onAttendeesSearch}
        onUserChange={handleAttendeesChange}
        groups={watch('invitedGroups')}
        onGroupSearch={searchGroups}
        onGroupsChange={handleGroupsChange}
        isGetGroupMembersLoading={isGetGroupMembersLoading}
      />
    </>
  );
};

export default PropagateSurveyDialogBody;
