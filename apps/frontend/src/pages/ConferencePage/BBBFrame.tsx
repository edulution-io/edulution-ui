import React from 'react';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';
import ControlPanel from '@/components/shared/ControlPanel';

const BBBIFrame = () => {
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const { joinConferenceUrl, setJoinConferenceUrl, toggleIsJoinedConferenceMinimized, isJoinedConferenceMinimized } =
    useConferenceDetailsDialogStore();

  if (!joinConferenceUrl) {
    return null;
  }

  const style = isJoinedConferenceMinimized ? { width: 0 } : {};

  return createPortal(
    <>
      <ControlPanel
        isMobileView={isMobileView}
        isMinimized={isJoinedConferenceMinimized}
        toggleMinimized={toggleIsJoinedConferenceMinimized}
        onClose={() => setJoinConferenceUrl('')}
        minimizeLabel={t('conferences.minimize')}
        closeLabel={t('conferences.close')}
        maximizeLabel={t('conferences.maximize')}
      />
      <iframe
        className="absolute inset-y-0 left-0 ml-0 mr-14 w-full md:w-[calc(100%-var(--sidebar-width))]"
        style={style}
        height="100%"
        src={joinConferenceUrl}
        title="BigBlueButton Meeting"
        allow="camera *; microphone *; display-capture *;"
        allowFullScreen
      />
    </>,
    document.body,
  );
};

export default BBBIFrame;
