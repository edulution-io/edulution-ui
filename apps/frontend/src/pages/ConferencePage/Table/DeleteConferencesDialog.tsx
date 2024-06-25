import React from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH';
import { useTranslation } from 'react-i18next';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Button } from '@/components/shared/Button';

interface DeleteConferencesDialogProps {
  trigger?: React.ReactNode;
}

const DeleteConferencesDialog = ({ trigger }: DeleteConferencesDialogProps) => {
  const { selectedRows } = useConferenceStore();
  const {
    isLoading,
    error,
    reset,
    deleteConferences,
    conferences,
    isDeleteConferencesDialogOpen,
    setIsDeleteConferencesDialogOpen,
  } = useConferenceStore();
  const { t } = useTranslation();

  const selectedConferenceIds = Object.keys(selectedRows);
  const selectedConferences = conferences.filter((c) => selectedConferenceIds.includes(c.meetingID));
  const isMultiDelete = selectedConferences.length > 1;

  const onSubmit = async () => {
    await deleteConferences(selectedConferences);
    setIsDeleteConferencesDialogOpen(false);
  };

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

    return (
      <div className="text-black">
        {error ? (
          <>
            {t('conferences.error')}: {error.message}
          </>
        ) : (
          <>
            {t(isMultiDelete ? 'conferences.confirmMultiDelete' : 'conferences.confirmSingleDelete')}
            {selectedConferences.map((c) => (
              <div
                className="mt-2"
                key={c.meetingID}
              >
                - {c.name}
              </div>
            ))}
          </>
        )}
      </div>
    );
  };

  const getFooter = () =>
    !error ? (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          disabled={isLoading}
          size="lg"
          onClick={onSubmit}
        >
          {t('conferences.delete')}
        </Button>
      </div>
    ) : (
      <div className="mt-4 flex justify-end">
        <Button
          variant="btn-collaboration"
          size="lg"
          onClick={() => reset()}
        >
          {t('conferences.cancel')}
        </Button>
      </div>
    );

  return (
    <AdaptiveDialogSH
      isOpen={isDeleteConferencesDialogOpen}
      trigger={trigger}
      handleOpenChange={() => setIsDeleteConferencesDialogOpen(!isDeleteConferencesDialogOpen)}
      title={t(isMultiDelete ? 'conferences.deleteConferences' : 'conferences.deleteConference', {
        count: selectedConferences.length,
      })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteConferencesDialog;
