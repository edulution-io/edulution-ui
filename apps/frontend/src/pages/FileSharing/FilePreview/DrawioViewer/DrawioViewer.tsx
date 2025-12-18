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
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import cn from '@libs/common/utils/className';
import DEFAULT_DRAWIO_URL from '@libs/filesharing/constants/defaultDrawioUrl';
import DrawioMessage from '@libs/filesharing/types/drawioMessage';
import DRAWIO_MESSAGE_EVENT from '@libs/filesharing/constants/drawioMessageEvent';
import DRAWIO_UI_THEME from '@libs/filesharing/constants/drawioUiTheme';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import useFileEditorContentStore from '@/pages/FileSharing/FilePreview/useFileEditorContentStore';
import useThemeStore from '@/store/useThemeStore';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { Theme } from '@libs/common/constants/theme';
import UserLanguage from '@libs/user/constants/userLanguage';

interface DrawioViewerProps {
  xmlContent: string;
  editMode?: boolean;
  isFullscreen?: boolean;
  webdavShare?: string;
}

const DrawioViewer = ({ xmlContent, editMode = false, isFullscreen = false, webdavShare }: DrawioViewerProps) => {
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);
  const theme = useThemeStore((s) => s.theme);

  const drawioBaseUrl =
    getExtendedOptionsValue(appConfigs, APPS.FILE_SHARING, ExtendedOptionKeys.DRAWIO_URL) || DEFAULT_DRAWIO_URL;

  const { setEditedContent, setIsDrawioModified, saveFile, isSaving } = useFileEditorContentStore();

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDrawioReady, setIsDrawioReady] = useState(false);
  const pendingSaveRef = useRef(false);

  const handleSaveComplete = useCallback(() => {
    iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ action: 'status', modified: false }), '*');
    pendingSaveRef.current = false;
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'string') return;

      try {
        const message = JSON.parse(event.data) as DrawioMessage;

        switch (message.event) {
          case DRAWIO_MESSAGE_EVENT.INIT:
            setIsDrawioReady(true);
            setIsLoading(false);
            break;

          case DRAWIO_MESSAGE_EVENT.LOAD:
            setIsLoading(false);
            break;

          case DRAWIO_MESSAGE_EVENT.AUTOSAVE:
            if (editMode && message.xml) {
              setEditedContent(message.xml);
              setIsDrawioModified(true);
            }
            break;

          case DRAWIO_MESSAGE_EVENT.SAVE:
            if (message.xml && editMode) {
              setEditedContent(message.xml);
              void saveFile(webdavShare, RequestResponseContentType.APPLICATION_XML).then(handleSaveComplete);
            }
            break;

          case DRAWIO_MESSAGE_EVENT.EXPORT:
            if (message.data && pendingSaveRef.current) {
              setEditedContent(message.data);
              void saveFile(webdavShare, RequestResponseContentType.APPLICATION_XML).then(handleSaveComplete);
            }
            break;

          case DRAWIO_MESSAGE_EVENT.EXIT:
            break;

          default:
            break;
        }
      } catch {
        pendingSaveRef.current = false;
      }
    },
    [editMode, webdavShare, setEditedContent, setIsDrawioModified, saveFile, handleSaveComplete],
  );

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  useEffect(() => {
    if (isDrawioReady && iframeRef.current?.contentWindow) {
      const loadMessage = {
        action: DRAWIO_MESSAGE_EVENT.LOAD,
        xml: xmlContent,
        autosave: editMode ? 1 : 0,
      };
      iframeRef.current.contentWindow.postMessage(JSON.stringify(loadMessage), '*');
    }
  }, [isDrawioReady, xmlContent, editMode]);

  const buildDrawioUrl = (): string => {
    const drawioUiTheme = theme === Theme.dark ? DRAWIO_UI_THEME.DARK : DRAWIO_UI_THEME.LIGHT;
    const params = new URLSearchParams({
      embed: '1',
      proto: 'json',
      spin: '1',
      ui: drawioUiTheme,
      lang: document.documentElement.lang || UserLanguage.GERMAN,
    });

    if (!editMode) {
      params.set('chrome', '0');
      params.set('toolbar', '0');
      params.set('nav', '1');
    } else {
      params.set('noSaveBtn', '0');
      params.set('saveAndExit', '0');
      params.set('noExitBtn', '1');
    }

    return `${drawioBaseUrl}/?${params.toString()}`;
  };

  return (
    <div className={cn('relative h-full w-full', { 'h-dvh': isFullscreen })}>
      {(isLoading || isSaving) && (
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center">
          <CircleLoader />
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={buildDrawioUrl()}
        title="Draw.io Viewer"
        className="h-full w-full border-none"
        allow="fullscreen"
      />
    </div>
  );
};

export default DrawioViewer;
