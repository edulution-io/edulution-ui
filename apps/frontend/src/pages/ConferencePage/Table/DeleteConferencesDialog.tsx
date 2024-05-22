import React, { useState } from 'react';
import AdaptiveDialogSH from '@/components/ui/AdaptiveDialogSH.tsx';
import { useTranslation } from 'react-i18next';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { Button } from '@/components/shared/Button';
import { Conference } from '@/pages/ConferencePage/dto/conference.dto';
import { useMediaQuery } from 'usehooks-ts';

interface DeleteConferencesDialogProps {
  trigger?: React.ReactNode;
  conferences: Conference[];
}

const DeleteConferencesDialog = ({ trigger, conferences }: DeleteConferencesDialogProps) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isLoading, error, reset, deleteConferences } = useConferenceStore();
  const { t } = useTranslation();

  const onSubmit = async () => {
    await deleteConferences(conferences);
    setIsOpen(false);
  };

  const getDialogBody = () => {
    if (isLoading) return <LoadingIndicator isOpen={isLoading} />;

    return (
      <div className={isMobile ? 'text-white' : 'text-black'}>
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
