import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useParticipateSurveyDialogStore from '@/pages/Survey/components/participation-dialog/ParticipateSurveyDialogStore';
import { ScrollArea } from '@/components/ui/ScrollArea';
import ParticipateSurvey from '@/pages/Survey/components/participation-dialog/ParticipateSurvey.tsx';

interface ParticipateSurveyDialogProps {
  trigger?: React.ReactNode;
}

const ParticipateSurveyDialog = ({ trigger }: ParticipateSurveyDialogProps) => {
  const { isParticipateSurveyDialogOpen, openParticipateSurveyDialog, closeParticipateSurveyDialog, isLoading, error } =
    useParticipateSurveyDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <ScrollArea>
        <ParticipateSurvey />
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
      isOpen={isParticipateSurveyDialogOpen}
      trigger={trigger}
      handleOpenChange={isParticipateSurveyDialogOpen ? closeParticipateSurveyDialog : openParticipateSurveyDialog}
      title={t('survey.participation')}
      body={getDialogBody()}
      desktopContentClassName="max-w-[75%]"
    />
  );
};

export default ParticipateSurveyDialog;
