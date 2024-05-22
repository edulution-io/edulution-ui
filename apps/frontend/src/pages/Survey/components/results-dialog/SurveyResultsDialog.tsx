import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollArea } from '@/components/ui/ScrollArea';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useSurveyResultsDialogStore from '@/pages/Survey/components/results-dialog/SurveyResultsDialogStore';
import SurveyResults from '@/pages/Survey/components/results-dialog/SurveyResults';

interface SurveyResultsDialogProps {
  trigger?: React.ReactNode;
}

const SurveyResultsDialog = ({ trigger }: SurveyResultsDialogProps) => {
  const { isSurveyResultsDialogOpen, openSurveyResultsDialog, closeSurveyResultsDialog, isLoading, error } =
    useSurveyResultsDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <ScrollArea>
        <SurveyResults />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </ScrollArea>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isSurveyResultsDialogOpen}
      trigger={trigger}
      handleOpenChange={isSurveyResultsDialogOpen ? closeSurveyResultsDialog : openSurveyResultsDialog}
      title={t('survey.resulting')}
      body={getDialogBody()}
      // footer={getFooter()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default SurveyResultsDialog;
