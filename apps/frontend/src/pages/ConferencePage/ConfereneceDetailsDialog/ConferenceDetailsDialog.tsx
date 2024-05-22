import React from 'react';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import CreateConferenceDialogBody from '@/pages/ConferencePage/CreateConference/CreateConferenceDialogBody';
import { Button } from '@/components/shared/Button';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH';
import { useTranslation } from 'react-i18next';
import FormData from '@/pages/ConferencePage/CreateConference/form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import useUserStore from '@/store/userStore';
import Attendee from '@/pages/ConferencePage/dto/attendee';

interface ConferenceDetailsDialogProps {
  trigger?: React.ReactNode;
}

const ConferenceDetailsDialog = ({ trigger }: ConferenceDetailsDialogProps) => {
  const { t } = useTranslation();
  const { user } = useUserStore();
  const { getConferences } = useConferenceStore();
  const { isLoading, error, selectedConference, setSelectedConference, updateConference } =
    useConferenceDetailsDialogStore();

  const initialFormValues: FormData = {
    name: selectedConference?.name || 'asd',
    password: selectedConference?.password || '',
    invitedAttendees: selectedConference?.invitedAttendees.filter((ia) => ia.username !== user) || [],
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

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const newConference = {
      name: form.getValues('name'),
      password: form.getValues('password'),
      invitedAttendees: [...form.getValues('invitedAttendees'), { username: user } as Attendee],
      meetingID: selectedConference?.meetingID,
    };

    await updateConference(newConference);
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
          {t('common.save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialogSH
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
