import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Button } from '@/components/shared/Button';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useUserStore from '@/store/userStore';
import EditPollFormData from '@/pages/PollsAndSurveysPage/Polls/dialogs/create-edit-poll/edit-poll-form';
import EditPollDialogBody from '@/pages/PollsAndSurveysPage/Polls/dialogs/create-edit-poll/EditPollDialogBody';
import useEditPollDialogStore from '@/pages/PollsAndSurveysPage/Polls/dialogs/create-edit-poll/EditPollDialogStore';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';

const createPollName = () => {
  const currentDate = new Date();
  const id = uuidv4();
  return `${currentDate.getFullYear()}${currentDate.getMonth()}${currentDate.getDay()}${currentDate.getHours()}${currentDate.getMinutes()}${currentDate.getSeconds()}${id}`;
};

interface EditPollDialogProps {
  isOpenEditPollDialog: boolean;
  openEditPollDialog: () => void;
  closeEditPollDialog: () => void;
  poll?: Poll;
  trigger?: React.ReactNode;
}

const EditPollDialog = (props: EditPollDialogProps) => {
  const { trigger, poll, isOpenEditPollDialog, openEditPollDialog, closeEditPollDialog } = props;

  const { isSaving, commitPoll, error } = useEditPollDialogStore();

  const { user } = useUserStore();

  const { t } = useTranslation();

  useEffect(() => {
    if (poll) {
      form.setValue('pollName', poll.pollName || createPollName());
      form.setValue('pollFormula', poll.poll || undefined);
      form.setValue('participants', poll.participants);
      form.setValue('created', poll.created || new Date());
    }
  }, [poll]);

  const initialFormValues: EditPollFormData = {
    pollName: poll?.pollName || createPollName(),
    pollFormula: poll?.poll || undefined,
    participants: poll?.participants || [],
    saveNo: undefined,
    created: poll?.created || new Date(),
  };

  const formSchema = z.object({
    pollFormula: z.string(),
    participants: z.array(
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
    saveNo: z.number().optional(),
    created: z.date().optional(),
  });

  const form = useForm<EditPollFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    console.log('onSubmit');

    const { pollName, pollFormula, participants, saveNo, created } = form.getValues();

    if (!pollName || !pollFormula || !participants) {
      throw new Error('Invalid form data');
    }

    commitPoll(pollName, pollFormula, participants, saveNo, created);
    closeEditPollDialog();
    form.reset();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if (isSaving) return <LoadingIndicator isOpen={isSaving} />;
    return (
      <>
        <EditPollDialogBody
          userName={user}
          form={form}
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('poll.error')}: {error.message}
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
          disabled={isSaving}
          size="lg"
          type="submit"
        >
          {t('save')}
        </Button>
      </form>
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpenEditPollDialog}
      trigger={trigger}
      handleOpenChange={isOpenEditPollDialog ? closeEditPollDialog : openEditPollDialog}
      title={t('poll.editing')}
      body={getDialogBody()}
      footer={getFooter()}
      desktopContentClassName="min-h-[75%] max-w-[85%]"
    />
  );
};

export default EditPollDialog;
