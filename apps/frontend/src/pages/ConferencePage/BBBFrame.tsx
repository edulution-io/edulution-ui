import React from 'react';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md';
import cn from '@/lib/utils';
import useIsMobileView from '@/hooks/useIsMobileView';

const BBBIFrame = () => {
  const isMobileView = useIsMobileView();
  const { t } = useTranslation();
  const { joinConferenceUrl, setJoinConferenceUrl, toggleIsJoinedConferenceMinimized, isJoinedConferenceMinimized } =
    useConferenceDetailsDialogStore();

  if (!joinConferenceUrl) {
    return null;
  }

  const style = isJoinedConferenceMinimized ? { width: 0 } : { width: isMobileView ? '100%' : 'calc(100% - 56px)' };

  return createPortal(
    <>
      <div
        className={cn(
          'fixed -top-1 left-1/2 z-10 -translate-x-1/2 transform',
          isMobileView && 'flex items-center space-x-4',
        )}
      >
        <button
          type="button"
          className="mr-1 rounded bg-blue-500 px-4 text-white hover:bg-blue-700"
          onClick={toggleIsJoinedConferenceMinimized}
        >
          {isJoinedConferenceMinimized ? <MdMaximize className="inline" /> : <MdMinimize className="inline" />}{' '}
          {isMobileView ? '' : t(isJoinedConferenceMinimized ? 'conferences.maximize' : 'conferences.minimize')}
        </button>
        <button
          type="button"
          className="rounded bg-ciLightRed px-4 text-white hover:bg-ciRed"
          onClick={() => setJoinConferenceUrl('')}
        >
          <MdClose className="inline" /> {isMobileView ? '' : t('conferences.close')}
        </button>
      </div>
      <iframe
        className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen"
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
