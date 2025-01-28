import React, { useEffect, useState } from 'react';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import { createPortal } from 'react-dom';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';
import testCookieAccess from '@libs/common/utils/testCookieAccess';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import { Button } from '@/components/shared/Button';

const BBBIFrame = () => {
  const { t } = useTranslation();
  const { joinConferenceUrl, setJoinConferenceUrl } = useConferenceDetailsDialogStore();
  const [isEmbeddingAllowed, setIsEmbeddingAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    void testCookieAccess().then((result) => {
      setIsEmbeddingAllowed(!!result?.results.CookieNoSameSiteNoSecure.wasSet);
    });
  }, []);

  if (!joinConferenceUrl) {
    return null;
  }

  if (joinConferenceUrl && isEmbeddingAllowed === null) {
    return <LoadingIndicator isOpen />;
  }

  const openInNewTab = () => window.open(joinConferenceUrl, '_blank', 'noopener,noreferrer');
  const openInNewTabDialog = (
    <AdaptiveDialog
      isOpen
      handleOpenChange={() => setJoinConferenceUrl('')}
      title={t('conferences.joinThisConference')}
      body={
        <div className="mt-6 flex flex-row-reverse">
          <Button
            variant="btn-collaboration"
            size="lg"
            type="button"
            onClick={openInNewTab}
          >
            {t('common.openInNewTab')}
          </Button>
        </div>
      }
    />
  );

  if (joinConferenceUrl && isEmbeddingAllowed === false) {
    const newWindow = openInNewTab();
    if (!newWindow) {
      return openInNewTabDialog;
    }
    setJoinConferenceUrl('');
    return null;
  }

  return createPortal(
    <ResizableWindow
      titleTranslationId="conferences.conference"
      handleClose={() => setJoinConferenceUrl('')}
    >
      <iframe
        className="h-full w-full border-none"
        src={joinConferenceUrl}
        title={t('conferences.conference')}
        allow="camera *; microphone *; display-capture *;"
        allowFullScreen
      />
    </ResizableWindow>,
    document.body,
  );
};

export default BBBIFrame;
