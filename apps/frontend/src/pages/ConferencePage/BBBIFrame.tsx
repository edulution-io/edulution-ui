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
