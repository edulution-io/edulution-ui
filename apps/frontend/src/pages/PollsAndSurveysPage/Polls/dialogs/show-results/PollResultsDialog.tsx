import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import { Poll } from '@/pages/PollsAndSurveysPage/Polls/backend-copy/model';
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

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (!poll?.poll) return <div>{t('poll.noFormula')}</div>;
    return (
      <ScrollArea>
        <PollVisualization pollFormula={poll.poll} choices={poll.choices} />
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
