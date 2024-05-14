import React from 'react';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import { Button } from '@/components/shared/Button';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import FormData from '@/pages/ConferencePage/CreateConference/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useCreateConferenceDialogStore from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';

interface ConferenceDetailsDialogProps {
  conference: Conference;
  trigger?: React.ReactNode;
}

const ConferenceDetailsDialog = ({ conference, trigger }: ConferenceDetailsDialogProps) => {
  const { t } = useTranslation();
  const { createConference } = useCreateConferenceDialogStore();
  const { getConferences } = useConferenceStore();
  const { isLoading, error, isConferenceDetailsDialogOpen, toggleIsConferenceDetailsDialogOpen } =
    useConferenceDetailsDialogStore();

  const initialFormValues: FormData = {
    name: conference.name,
    password: conference.password,
    isPublic: conference.password ? 'false' : 'true',
    invitedAttendees: conference.invitedAttendees,
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

  const form = useForm<z.infer<typeof formSchema>>({
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
          {t('common.add')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isConferenceDetailsDialogOpen}
      trigger={trigger}
      handleOpenChange={toggleIsConferenceDetailsDialogOpen}
      title={t('conferences.create')}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ConferenceDetailsDialog;
