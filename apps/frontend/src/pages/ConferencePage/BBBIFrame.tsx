/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';

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
        allow={IFRAME_ALLOWED_CONFIG}
        allowFullScreen
      />
    </ResizableWindow>,
    document.body,
  );
};

export default BBBIFrame;
