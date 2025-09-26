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

import React, { ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import FileRenderer from '@/pages/FileSharing/FilePreview/FileRenderer';
import ResizableWindow from '@/components/structure/framing/ResizableWindow/ResizableWindow';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import FILE_PREVIEW_ELEMENT_ID from '@libs/filesharing/constants/filePreviewElementId';
import useWindowResize from '@/hooks/useWindowResize';
import OpenInNewTabButton from '@/components/structure/framing/ResizableWindow/Buttons/OpenInNewTabButton';
import FILE_PREVIEW_ROUTE from '@libs/filesharing/constants/routes';
import EditButton from '@/components/structure/framing/ResizableWindow/Buttons/EditButton';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import useMedia from '@/hooks/useMedia';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ContentType from '@libs/filesharing/types/contentType';
import isValidFileToPreview from '@libs/filesharing/utils/isValidFileToPreview';
import ToggleDockButton from '@/components/structure/framing/ResizableWindow/Buttons/ToggleDockButton';
import { useLocation } from 'react-router-dom';
import useFrameStore from '@/components/structure/framing/useFrameStore';
import RESIZEABLE_WINDOW_DEFAULT_POSITION from '@libs/ui/constants/resizableWindowDefaultPosition';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';

const FileSharingPreviewFrame = () => {
  const { t } = useTranslation();
  const {
    addFileToOpenInNewTab,
    currentlyEditingFile,
    setCurrentlyEditingFile,
    setIsFilePreviewVisible,
    isFilePreviewVisible,
    isFilePreviewDocked,
    setIsFilePreviewDocked,
  } = useFileEditorStore();
  const { loadDownloadUrl } = useFileSharingDownloadStore();
  const { setFileIsCurrentlyDisabled } = useFileSharingStore();
  const { setCurrentWindowedFrameSize } = useFrameStore();
  const windowSize = useWindowResize();
  const location = useLocation();
  const closingRef = useRef(false);

  const [filePreviewRect, setFilePreviewRect] = useState<Pick<DOMRect, 'x' | 'y' | 'width' | 'height'> | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const el = document.getElementById(FILE_PREVIEW_ELEMENT_ID);
    if (!el) {
      setFilePreviewRect(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    setFilePreviewRect({
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    });
  }, [windowSize, currentlyEditingFile, isEditMode]);

  const resetPreview = () => {
    setIsFilePreviewVisible(false);
    setIsFilePreviewDocked(true);
    setCurrentlyEditingFile(null);
  };

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const webdavShare = pathSegments[1];

  const openInNewTab = () => {
    if (currentlyEditingFile) {
      addFileToOpenInNewTab(currentlyEditingFile);
      window.open(`/${FILE_PREVIEW_ROUTE}?share=${webdavShare}&file=${currentlyEditingFile.etag}`, '_blank');
      resetPreview();
    }
  };

  useEffect(() => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (currentlyEditingFile) {
      void loadDownloadUrl(currentlyEditingFile, webdavShare, controller.signal);
    }

    return () => controller.abort();
  }, [currentlyEditingFile, isEditMode]);

  const handleCloseFile = async () => {
    if (!currentlyEditingFile) return;
    closingRef.current = true;
    const { filename } = currentlyEditingFile;
    setIsEditMode(false);
    resetPreview();
    await setFileIsCurrentlyDisabled(filename, true, 5000);
    closingRef.current = false;
  };

  const { isMobileView } = useMedia();
  const { appConfigs } = useAppConfigsStore();

  const { x, y, width, height } = filePreviewRect || { x: 0, y: 0, width: 0, height: 0 };

  const initialPositionMemo = useMemo(
    () => (isFilePreviewDocked ? { x, y } : RESIZEABLE_WINDOW_DEFAULT_POSITION),
    [isFilePreviewDocked, x, y],
  );
  const initialSizeMemo = useMemo(
    () => (isFilePreviewDocked ? { width, height } : undefined),
    [isFilePreviewDocked, width, height],
  );

  const isDocumentServerConfigured = !!getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  );
  const isOnlyOfficeDoc =
    !!currentlyEditingFile && isOnlyOfficeDocument(currentlyEditingFile.filename ?? currentlyEditingFile.filePath);

  const isValidFile = currentlyEditingFile?.type === ContentType.FILE && isValidFileToPreview(currentlyEditingFile);

  const isFileReady =
    (isValidFile && !isMobileView && (isOnlyOfficeDoc ? isDocumentServerConfigured : true)) ||
    currentlyEditingFile?.filename.endsWith('pdf');

  const hidePreviewOnOtherPages = pathSegments[0] !== APPS.FILE_SHARING && isFilePreviewDocked;

  if (!isFilePreviewVisible || !isFileReady || !filePreviewRect || hidePreviewOnOtherPages) return null;

  const windowTitle = currentlyEditingFile?.filename || t(`filesharing.filePreview`);

  const isEditButtonVisible = !isEditMode && isOnlyOfficeDocument(currentlyEditingFile?.filename || '');
  const additionalButtons = [
    <OpenInNewTabButton
      onClick={openInNewTab}
      key={OpenInNewTabButton.name}
    />,
    isEditButtonVisible && (
      <EditButton
        onClick={() => setIsEditMode(true)}
        key={EditButton.name}
      />
    ),
    isFilePreviewDocked && (
      <ToggleDockButton
        onClick={() => {
          setIsFilePreviewDocked(!isFilePreviewDocked);
          setCurrentWindowedFrameSize(windowTitle, undefined);
        }}
        isDocked={isFilePreviewDocked}
        key={ToggleDockButton.name}
      />
    ),
  ].filter((b): b is ReactElement => Boolean(b));

  return (
    <ResizableWindow
      disableMinimizeWindow={isFilePreviewDocked}
      disableToggleMaximizeWindow={false}
      titleTranslationId={windowTitle}
      handleClose={handleCloseFile}
      initialPosition={initialPositionMemo}
      initialSize={initialSizeMemo}
      openMaximized={false}
      stickToInitialSizeAndPositionWhenRestored={isFilePreviewDocked}
      additionalButtons={additionalButtons}
    >
      <FileRenderer
        editMode={isEditMode}
        closingRef={closingRef}
        isOnlyOfficeConfigured={isDocumentServerConfigured}
      />
    </ResizableWindow>
  );
};

export default FileSharingPreviewFrame;
