import React from 'react';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { useTranslation } from 'react-i18next';
import { Form } from '@/components/ui/Form';
import { UseFormReturn } from 'react-hook-form';
import FormField from '@/components/shared/FormField';
import SearchUsersOrGroups from '@/pages/ConferencePage/CreateConference/SearchUsersOrGroups';
import { MultipleSelectorOptionSH } from '@/components/ui/MultipleSelectorSH';
import Attendee from '@/pages/ConferencePage/dto/attendee';
import useUserStore from '@/store/userStore';
import Group from '@/pages/ConferencePage/dto/group';
import { toast } from 'sonner';

interface CreateConferenceDialogBodyProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>;
}

const CreateConferenceDialogBody = ({ form }: CreateConferenceDialogBodyProps) => {
  const { setValue, getValues, watch } = form;
  const { user } = useUserStore();
  const { isLoading, searchAttendees, searchGroups, getGroupMembers, isGetGroupMembersLoading } =
    useCreateConferenceDialogStore();
  const { t } = useTranslation();

  if (isLoading) return <div>Loading...</div>;

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
        <FormField
          name="name"
          form={form}
          labelTranslationId={t('conferences.name')}
          isLoading={isLoading}
          variant={'default'}
        />
        <SearchUsersOrGroups
          users={watch('invitedAttendees')}
          onSearch={onAttendeesSearch}
          onUserChange={handleAttendeesChange}
          groups={watch('invitedGroups')}
          onGroupSearch={searchGroups}
          onGroupsChange={handleGroupsChange}
          isGetGroupMembersLoading={isGetGroupMembersLoading}
        />
        <FormField
          name="password"
          form={form}
          labelTranslationId={t('conferences.password')}
          type="password"
          isLoading={isLoading}
          variant={'default'}
        />
      </form>
    </Form>
  );
};

export default CreateConferenceDialogBody;
