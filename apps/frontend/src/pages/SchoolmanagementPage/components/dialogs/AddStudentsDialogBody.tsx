import React from 'react';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import useUserStore from '@/store/userStore';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import Group from '@/pages/ConferencePage/dto/group';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/CircleLoader';

interface AddConferenceDialogBodyProps {
  form: UseFormReturn<any>;
}

const AddStudentsDialogBody = ({ form }: AddConferenceDialogBodyProps) => {
  const { setValue, getValues, watch } = form;
  const { user } = useUserStore();
  const { t } = useTranslation();
  const { isLoading, searchAttendees, searchGroups, getGroupMembers, isGetGroupMembersLoading } =
    useCreateConferenceDialogStore();

  if (isLoading) return <CircleLoader className={'mx-auto'} />;

  const handleAttendeesChange = (attendees: MultipleSelectorOptionSH[]) => {
    setValue('invitedAttendees', attendees, { shouldValidate: true });
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
      const attendees = getValues('invitedAttendees') as Attendee[];

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

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <SearchUsersOrGroups
          users={watch('invitedAttendees')}
          onSearch={onAttendeesSearch}
          onUserChange={handleAttendeesChange}
          groups={watch('invitedGroups')}
          onGroupSearch={searchGroups}
          onGroupsChange={handleGroupsChange}
          isGetGroupMembersLoading={isGetGroupMembersLoading}
        />
      </form>
    </Form>
  );
};

export default AddStudentsDialogBody;
