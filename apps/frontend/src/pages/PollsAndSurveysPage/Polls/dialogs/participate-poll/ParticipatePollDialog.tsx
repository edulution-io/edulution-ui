import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
import ParticipatePollFormData
  from '@/pages/PollsAndSurveysPage/Polls/dialogs/participate-poll/participate-poll-form';
import ParticipatePollDialogBody
  from '@/pages/PollsAndSurveysPage/Polls/dialogs/participate-poll/ParticipatePollDialogBody';
import useParticipatePollDialogStore
  from '@/pages/PollsAndSurveysPage/Polls/dialogs/participate-poll/ParticipatePollDialogStore';


interface ParticipatePollDialogProps {
  isOpenParticipatePollDialog: boolean;
  openParticipatePollDialog: () => void;
  closeParticipatePollDialog: () => void;

  shouldRefreshOpen: () => void;
  shouldRefreshParticipated: () => void;

  poll: Poll;
  trigger?: React.ReactNode;
}

const ParticipatePollDialog = (props: ParticipatePollDialogProps) => {
  const {
    trigger,
    isOpenParticipatePollDialog,
    openParticipatePollDialog,
    closeParticipatePollDialog,

    shouldRefreshOpen,
    shouldRefreshParticipated,

    poll,
  } = props;

  const {
    isAnswering,
    commitChoice,
    error,
  } = useParticipatePollDialogStore();

  const { t } = useTranslation();

  const initialFormValues: ParticipatePollFormData = {
    choice: undefined,
    options: undefined,
  };

  const formSchema = z.object({
    choice: z.string(),
    options: z.any(),
  });

  const form = useForm<ParticipatePollFormData>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    const { choice, options } = form.getValues();

    console.log('choice', choice);

    if(!choice) {
      throw new Error('Invalid form data');
    }

    commitChoice(poll.pollName, choice, options);
    form.reset();
    closeParticipatePollDialog();

    shouldRefreshOpen();
    shouldRefreshParticipated();
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  const getDialogBody = () => {
    if(!poll) return null;
    const pollJSON = poll.poll;
    if (isAnswering) return <LoadingIndicator isOpen={isAnswering} />;
    return (
      <>
        <ParticipatePollDialogBody
          pollName={ poll.pollName }
          pollString={ pollJSON }
          closeParticipatePollDialog={ closeParticipatePollDialog }
          isAnswering={ isAnswering }
          handleFormSubmit={ handleFormSubmit }
          form={ form }
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('poll.error')}: {error.message}
          </div>
        ) : null}
      </>
    );
  };

  // const getFooter = () => (
  //   <div className="mt-4 flex justify-end">
  //     <form onSubmit={handleFormSubmit}>
  //       <Button
  //         variant="btn-collaboration"
  //         disabled={isAnswering}
  //         size="lg"
  //         type="submit"
  //       >
  //         {t('save')}
  //       </Button>
  //     </form>
  //   </div>
  // );

  return (
    <AdaptiveDialog
      isOpen={isOpenParticipatePollDialog}
      trigger={trigger}
      handleOpenChange={isOpenParticipatePollDialog ? closeParticipatePollDialog : openParticipatePollDialog}
      title={t('poll.participation')}
      body={getDialogBody()}
      // footer={getFooter()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ParticipatePollDialog;
