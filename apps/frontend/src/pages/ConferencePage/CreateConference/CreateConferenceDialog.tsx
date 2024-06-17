import React from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import FormData from '@/pages/ConferencePage/CreateConference/form';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';

interface CreateConferenceDialogProps {
  trigger?: React.ReactNode;
}

const CreateConferenceDialog = ({ trigger }: CreateConferenceDialogProps) => {
  const {
    isCreateConferenceDialogOpen,
    openCreateConferenceDialog,
    closeCreateConferenceDialog,
    isLoading,
    error,
    createConference,
  } = useCreateConferenceDialogStore();
  const { getConferences } = useConferenceStore();

  const { t } = useTranslation();

  const initialFormValues: FormData = {
    name: '',
    password: '',
    invitedAttendees: [],
  };

  const formSchema = z.object({
    name: z
      .string()
      .min(3, { message: t('conferences.min_3_chars') })
      .max(30, { message: t('conferences.max_30_chars') }),
    password: z.string().optional(),
    invitedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
  });

  const form = useForm<FormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
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
    return (
      <>
        <CreateConferenceDialogBody form={form} />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('conferences.error')}: {error.message}
          </div>
        ) : null}
      </>
    );
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
