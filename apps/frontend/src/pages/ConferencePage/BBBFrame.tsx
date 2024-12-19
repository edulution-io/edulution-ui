import React from 'react';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import { createPortal } from 'react-dom';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';

const BBBIFrame = () => {
  const { t } = useTranslation();
  const { joinConferenceUrl, setJoinConferenceUrl } = useConferenceDetailsDialogStore();

  if (!joinConferenceUrl) return null;

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
