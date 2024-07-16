import React from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import ConferencesForm from '@libs/conferences/types/conferencesForm';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import getConferencesFormSchema from '@/pages/ConferencePage/formSchema';

interface CreateConferenceDialogProps {
  trigger?: React.ReactNode;
}

const CreateConferenceDialog = ({ trigger }: CreateConferenceDialogProps) => {
  const {
    isCreateConferenceDialogOpen,
    openCreateConferenceDialog,
    closeCreateConferenceDialog,
    isLoading,
    createConference,
  } = useCreateConferenceDialogStore();
  const { getConferences } = useConferenceStore();

  const { t } = useTranslation();

  const initialFormValues: ConferencesForm = {
    name: '',
    password: '',
    invitedAttendees: [],
    invitedGroups: [],
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
      invitedAttendees: form.getValues('invitedAttendees'),
    };

    await createConference(newConference);
    await getConferences();
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
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
          {t('common.create')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialogSH
      isOpen={isCreateConferenceDialogOpen}
      trigger={trigger}
      handleOpenChange={isCreateConferenceDialogOpen ? closeCreateConferenceDialog : openCreateConferenceDialog}
      title={t('conferences.create')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default CreateConferenceDialog;
