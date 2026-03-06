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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import { cn } from '@edulution-io/ui-kit';
import IFRAME_ALLOWED_CONFIG from '@libs/ui/constants/iframeAllowedConfig';

interface CollaboraEditorProps {
  collaboraUrl: string;
  wopiSrc: string;
  accessToken: string;
  accessTokenTTL: number;
  editorPath: string;
  editMode?: boolean;
  isOpenedInNewTab?: boolean;
}

const COLLABORA_FRAME_NAME = 'collabora-frame';
const COLLABORA_MIN_WIDTH_PX = 800;
const COLLABORA_MSG_ACTION_CLOSE = 'Action_Close';
const COLLABORA_BLANK_URL = 'about:blank';

const CollaboraEditor = ({
  collaboraUrl,
  wopiSrc,
  accessToken,
  accessTokenTTL,
  editorPath,
  editMode,
  isOpenedInNewTab,
}: CollaboraEditorProps) => {
  const { t } = useTranslation();
  const formRef = useRef<HTMLFormElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formSubmittedRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);

  const collaboraOrigin = collaboraUrl ? new URL(collaboraUrl).origin : '';

  useEffect(() => {
    if (formRef.current) {
      setIsLoading(true);
      formSubmittedRef.current = true;
      formRef.current.submit();
    }
  }, [collaboraUrl, wopiSrc, accessToken, editMode]);

  useEffect(
    () => () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ MessageId: COLLABORA_MSG_ACTION_CLOSE }),
          collaboraOrigin,
        );
        iframeRef.current.src = COLLABORA_BLANK_URL;
      }
    },
    [],
  );

  const handleIframeLoad = useCallback(() => {
    if (formSubmittedRef.current) {
      setIsLoading(false);
    }
  }, []);

  const permission = editMode ? 'edit' : 'readonly';
  const iframeSrc = `${collaboraUrl}${editorPath}?WOPISrc=${encodeURIComponent(wopiSrc)}&permission=${permission}`;

  return (
    <div className={cn('relative h-full w-full overflow-x-auto', { 'h-dvh': isOpenedInNewTab })}>
      {isLoading && (
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
          <CircleLoader />
        </div>
      )}
      <form
        ref={formRef}
        action={iframeSrc}
        method="POST"
        target={COLLABORA_FRAME_NAME}
        className="hidden"
      >
        <input
          type="hidden"
          name="access_token"
          value={accessToken}
        />
        <input
          type="hidden"
          name="access_token_ttl"
          value={accessTokenTTL.toString()}
        />
      </form>
      <iframe
        ref={iframeRef}
        name={COLLABORA_FRAME_NAME}
        title={t('filesharing.collaboraEditor')}
        className="h-full w-full border-none"
        style={{ minWidth: COLLABORA_MIN_WIDTH_PX }}
        allow={IFRAME_ALLOWED_CONFIG}
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default CollaboraEditor;
