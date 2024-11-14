import React from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import ConferencesForm from '@libs/conferences/types/conferencesForm';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import AttendeeDto from '@libs/user/types/attendee.dto';
import useUserStore from '@/store/UserStore/UserStore';
import getConferencesFormSchema from '@libs/conferences/constants/formSchema';

interface ConferenceDetailsDialogProps {
  trigger?: React.ReactNode;
}

const ConferenceDetailsDialog = ({ trigger }: ConferenceDetailsDialogProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { getConferences } = useConferenceStore();
  const { isLoading, selectedConference, setSelectedConference, updateConference } = useConferenceDetailsDialogStore();

  const initialFormValues: ConferencesForm = {
    name: selectedConference?.name || '',
    password: selectedConference?.password || '',
    invitedAttendees: selectedConference?.invitedAttendees.filter((ia) => ia.username !== user?.username) || [],
    invitedGroups: selectedConference?.invitedGroups || [],
  };

  const form = useForm<ConferencesForm>({
    mode: 'onChange',
    resolver: zodResolver(getConferencesFormSchema(t)),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const newConference = {
      name: form.getValues('name'),
      password: form.getValues('password'),
      invitedAttendees: [...form.getValues('invitedAttendees'), { username: user?.username } as AttendeeDto],
      invitedGroups: form.getValues('invitedGroups'),
      meetingID: selectedConference?.meetingID,
    };

    await updateConference(newConference);
    await getConferences();
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);
  const getDialogBody = () => {
    if (isLoading || !selectedConference) return <LoadingIndicator isOpen={isLoading} />;
    return <CreateConferenceDialogBody form={form} />;
  };

  const getFooter = () => (
    <div className="mt-4 flex justify-end">
      <form onSubmit={handleFormSubmit}>
        <Button
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          type="submit"
        >
          {t('common.save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen
      trigger={trigger}
      handleOpenChange={() => setSelectedConference(null)}
      title={t('conferences.editConference')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ConferenceDetailsDialog;
