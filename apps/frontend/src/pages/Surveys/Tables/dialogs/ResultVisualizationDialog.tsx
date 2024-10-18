import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import ResultVisualizationDialogBody from '@/pages/Surveys/Tables/dialogs/ResultVisualizationDialogBody';

const ResultVisualizationDialog = () => {
  const { isOpenPublicResultsVisualisationDialog, setIsOpenPublicResultsVisualisationDialog, isLoading } =
    useResultDialogStore();

  const { t } = useTranslation();

  return isOpenPublicResultsVisualisationDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsVisualisationDialog}
        handleOpenChange={() => setIsOpenPublicResultsVisualisationDialog(!isOpenPublicResultsVisualisationDialog)}
        title={t('surveys.resultChartDialog.title')}
        body={<ResultVisualizationDialogBody />}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultVisualizationDialog;
