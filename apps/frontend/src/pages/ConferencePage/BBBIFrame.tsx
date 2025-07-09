/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useEffect, useState } from 'react';
import useConferenceDetailsDialogStore from '@/pages/ConferencePage/ConfereneceDetailsDialog/useConferenceDetailsDialogStore';
import { createPortal } from 'react-dom';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import { useTranslation } from 'react-i18next';
import testCookieAccess from '@libs/common/utils/testCookieAccess';
import LoadingIndicatorDialog from '@/components/ui/Loading/LoadingIndicatorDialog';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import OpenInNewTabButton from '@/components/structure/framing/ResizableWindow/Buttons/OpenInNewTabButton';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

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
    return <LoadingIndicatorDialog isOpen />;
  }

  const openInNewTab = () => window.open(joinConferenceUrl, '_blank', 'noopener,noreferrer');
  const handleClose = () => setJoinConferenceUrl('');

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={openInNewTab}
      submitButtonText="common.openInNewTab"
    />
  );

  const openInNewTabDialog = (
    <AdaptiveDialog
      isOpen
      handleOpenChange={handleClose}
      title={t('conferences.joinThisConference')}
      footer={getFooter()}
      body={null}
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

  const additionalButtons = [
    <OpenInNewTabButton
      onClick={() => {
        openInNewTab();
        setJoinConferenceUrl('');
      }}
      key={OpenInNewTabButton.name}
    />,
  ];

  return createPortal(
    <ResizableWindow
      titleTranslationId="conferences.conference"
      handleClose={() => setJoinConferenceUrl('')}
      additionalButtons={additionalButtons}
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
