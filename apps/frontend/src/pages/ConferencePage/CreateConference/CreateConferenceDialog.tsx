import React from 'react';
import axios from 'axios';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import { Button } from '@/components/shared/Button';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useConferenceQuery from '@/api/useConferenceQuery';
import FormData from '@/pages/ConferencePage/CreateConference/form';

interface CreateConferenceDialogProps {
  trigger?: React.ReactNode;
}

const CreateConferenceDialog = ({ trigger }: CreateConferenceDialogProps) => {
  const {
    isCreateConferenceDialogOpen,
    openCreateConferenceDialog,
    closeCreateConferenceDialog,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = useCreateConferenceDialogStore();
  const { createConference } = useConferenceQuery();
  const { t } = useTranslation();

  const initialFormValues: FormData = {
    name: '',
    password: '',
    isPublic: 'true',
  };

  const formSchema = z.object({
    name: z
      .string()
      .min(3, { message: t('conferences.min_3_chars') })
      .max(30, { message: t('conferences.max_30_chars') }),
    isPublic: z.string(),
    password: z
      .string()
      .optional()
      .refine(
        (val) => {
          // eslint-disable-next-line @typescript-eslint/no-use-before-define, @typescript-eslint/no-unnecessary-type-assertion
          const isPublic = form.watch('isPublic') as string;
          return !(isPublic === 'false' && !val);
        },
        {
          message: t('conferences.password_required'),
        },
      ),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await createConference({
        name: form.getValues('name'),
        password: form.getValues('password'),
        attendees: [],
      });
    } catch (e) {
      if (axios.isAxiosError(e)) {
        setError(e);
      } else {
        throw e;
      }
    } finally {
      setIsLoading(false);
    }
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
          {t('common.add')}
        </Button>
      </form>
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
