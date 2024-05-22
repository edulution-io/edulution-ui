import React from 'react';
import { useTranslation } from 'react-i18next';
import AdaptiveDialog from '@/components/shared/AdaptiveDialog';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import useCreateConferenceDialogStore from '@/pages/Survey/components/edit-dialog/EditSurveyDialogStore';
import EditSurveyDialogBody from '@/pages/Survey/components/edit-dialog/EditSurveyDialogBody';
import useSurveyStore from '@/pages/Survey/SurveyStore';

interface EditSurveyDialogProps {
  trigger?: React.ReactNode;
}

const EditSurveyDialog = ({ trigger }: EditSurveyDialogProps) => {
  const { setShouldRefresh } = useSurveyStore();
  const { isEditSurveyDialogOpen, openEditSurveyDialog, closeEditSurveyDialog, isLoading, error } =
    useCreateConferenceDialogStore();

  const { t } = useTranslation();

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;
    return (
      <>
        <EditSurveyDialogBody // form={form}
        />
        {error ? (
          <div className="rounded-xl bg-red-400 py-3 text-center text-black">
            {t('survey.error')}: {error.message}
          </div>
        ) : null}
      </>
    );
  };

  return (
    <AdaptiveDialog
      isOpen={isEditSurveyDialogOpen}
      trigger={trigger}
      handleOpenChange={
        isEditSurveyDialogOpen
          ? () => {
              setShouldRefresh(true);
              closeEditSurveyDialog();
            }
          : openEditSurveyDialog
      }
      title={t('survey.editing')}
      body={getDialogBody()}
      desktopContentClassName="min-h-[75%] max-w-[75%]"
    />
  );
};

export default EditSurveyDialog;
