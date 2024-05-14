import React from 'react';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/ConferenceDetailsDialogStore';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { MdClose, MdMaximize, MdMinimize } from 'react-icons/md'; // If you are fetching the HTML content dynamically

const BBBIFrame = () => {
  const { t } = useTranslation();
  const { joinConferenceUrl, setJoinConferenceUrl, toggleIsJoinedConferenceMinimized, isJoinedConferenceMinimized } =
    useConferenceDetailsDialogStore();

  if (!joinConferenceUrl) {
    return null;
  }

  const style = isJoinedConferenceMinimized ? { width: 0 } : { width: 'calc(100% - 56px)' };

  return createPortal(
    <>
      <div className="fixed -top-1 left-1/2 z-10 -translate-x-1/2 transform">
        <button
          type="button"
          className="mr-1 rounded bg-blue-500 px-4 text-white hover:bg-blue-700"
          onClick={toggleIsJoinedConferenceMinimized}
        >
          {isJoinedConferenceMinimized ? <MdMaximize className="inline" /> : <MdMinimize className="inline" />}{' '}
          {t(isJoinedConferenceMinimized ? 'conferences.maximize' : 'conferences.minimize')}
        </button>
        <button
          type="button"
          className="rounded bg-red-500 px-4 text-white hover:bg-red-700"
          onClick={() => setJoinConferenceUrl('')}
        >
          <MdClose className="inline" /> {t('conferences.close')}
        </button>
      </div>
      <iframe
        className="absolute inset-y-0 left-0 ml-0 mr-14 w-screen"
        style={style}
        height="100%"
        src={joinConferenceUrl}
        title="BigBlueButton Meeting"
        allow="camera *.netzint.de; microphone *.netzint.de; display-capture *.netzint.de;"
        allowFullScreen
      />
    </>,
    document.body,
  );
};

export default BBBIFrame;
