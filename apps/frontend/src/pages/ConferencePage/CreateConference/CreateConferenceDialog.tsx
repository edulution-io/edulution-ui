import React from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import LoadingIndicator from '@/components/shared/LoadingIndicator';

interface CreateConferenceDialogProps {
  trigger?: React.ReactNode;
}

const CreateConferenceDialog = ({ trigger }: CreateConferenceDialogProps) => {
  const {
    isCreateConferenceDialogOpen,
    openCreateConferenceDialog,
    closeCreateConferenceDialog,
    createConference,
    isLoading,
    error,
    reset,
  } = useCreateConferenceDialogStore();
  const { t } = useTranslation();

  const formSchema: z.Schema = z.object({
    name: z
      .string()
      .min(0, { message: t('conferences.too_short') })
      .max(32, { message: t('name.too_long') }),
    password: z
      .string()
      .min(0, { message: t('conferences.too_short') })
      .max(32, { message: t('conferences.too_long') }),
    isPublic: z.boolean(),
  });

  const initialFormValues = {
    name: '',
    password: '',
    isPublic: true,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    await createConference('meetingID', form.getValues<string>('name') as string, '1234');
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    if (error)
      return (
        <div className="text-black">
          {t('conferences.error')}: {error.message}
        </div>
      );
    return <CreateConferenceDialogBody form={form} />;
  };

  const getFooter = () =>
    !error ? (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          onClick={handleFormSubmit}
        >
          {t('common.add')}
        </Button>
      </div>
    ) : (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="lg"
          onClick={() => {
            reset();
            form.reset();
          }}
        >
          {t('conferences.cancel')}
        </Button>
      </div>
    );

  return (
    <AdaptiveDialog
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
