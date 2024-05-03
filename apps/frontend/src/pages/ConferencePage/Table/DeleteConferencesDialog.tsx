import React, { useState } from 'react';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { useTranslation } from 'react-i18next';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Button } from '@/components/shared/Button';
import { Conference } from '@/pages/ConferencePage/model';

interface DeleteConferencesDialogProps {
  trigger?: React.ReactNode;
  conferences: Conference[];
}

const DeleteConferencesDialog = ({ trigger, conferences }: DeleteConferencesDialogProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isLoading, error, reset, deleteConferences } = useConferenceStore();
  const { t } = useTranslation();

  const onSubmit = async () => {
    await deleteConferences(conferences);
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
            {t('conferences.confirmDelete')}
            {conferences.map((c) => (
              <div
                className="mt-2"
                key={c.meetingID}
              >
                - {c.meetingName}
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
    <AdaptiveDialog
      isOpen={isOpen}
      trigger={trigger}
      handleOpenChange={isOpen ? () => setIsOpen(false) : () => setIsOpen(true)}
      title={t('conferences.deleteConferences', { count: conferences.length })}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default DeleteConferencesDialog;
