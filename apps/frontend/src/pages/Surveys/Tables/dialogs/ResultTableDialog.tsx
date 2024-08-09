import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useResultDialogStore from '@/pages/Surveys/Tables/dialogs/useResultDialogStore';
import ResultTableDialogBodyWrapper from '@/pages/Surveys/Tables/dialogs/ResultTableDialogBody';
import './resultTableDialog.css';

const ResultTableDialog = () => {
  const { isOpenPublicResultsTableDialog, setIsOpenPublicResultsTableDialog, isLoading } = useResultDialogStore();

  const { t } = useTranslation();

  return isOpenPublicResultsTableDialog ? (
    <>
      {isLoading ? <LoadingIndicator isOpen={isLoading} /> : null}
      <AdaptiveDialog
        isOpen={isOpenPublicResultsTableDialog}
        handleOpenChange={() => setIsOpenPublicResultsTableDialog(!isOpenPublicResultsTableDialog)}
        title={t('surveys.resultTableDialog.title')}
        body={<ResultTableDialogBodyWrapper />}
        desktopContentClassName="max-h-[75vh] max-w-[85%]"
      />
    </>
  ) : null;
};

export default ResultTableDialog;
