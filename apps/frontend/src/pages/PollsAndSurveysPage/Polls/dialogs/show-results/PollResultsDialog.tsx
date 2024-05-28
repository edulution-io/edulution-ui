import React /* , {useEffect} */ from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
// import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
// import ResultVisualisation from '@/pages/PollsAndSurveysPage/Polls/dialogs/show-results/PollVisualization';
// import PollSubmissions from '@/pages/PollsAndSurveysPage/Polls/dialogs/show-results/PollSubmissions';
import PollVisualization from '@/pages/PollsAndSurveysPage/Polls/dialogs/show-results/PollVisualization';

interface PollResultsDialogProps {
  isOpenPollResultsDialog: boolean;
  openPollResultsDialog: () => void;
  closePollResultsDialog: () => void;
  poll: Poll;
  trigger?: React.ReactNode;
}

const PollResultsDialog = (props: PollResultsDialogProps) => {
  const { isOpenPollResultsDialog, openPollResultsDialog, closePollResultsDialog, poll, trigger} = props;
  // const { isLoading, error, choices, getPollResults } =
  //   usePollResultDialogStore();

  const { t } = useTranslation();

  // useEffect(() => {
  //   if (poll) {
  //     getPollResults(poll.pollName);
  //   }
  // }, []);

  const getDialogBody = () => {
    // if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    if (!poll?.poll) return <div>{t('poll.noFormula')}</div>;
    return (
      <ScrollArea>
        {/*<ResultVisualisation formula={poll.poll} answers={answers!} />*/}
        <PollVisualization pollFormula={poll.poll} choices={poll.choices} />
        {/*{error ? (*/}
        {/*  <div className="rounded-xl bg-red-400 py-3 text-center text-black">*/}
        {/*    {t('survey.error')}: {error.message}*/}
        {/*  </div>*/}
        {/*) : null}*/}
      </ScrollArea>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isOpenPollResultsDialog}
      trigger={trigger}
      handleOpenChange={isOpenPollResultsDialog ? closePollResultsDialog : openPollResultsDialog}
      title={t('survey.resulting')}
      body={getDialogBody()}
      desktopContentClassName="min-h-[75%] max-w-[85%]"
    />
  );
};

export default PollResultsDialog;
