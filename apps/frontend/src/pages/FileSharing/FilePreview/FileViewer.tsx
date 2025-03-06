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

import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import FileRenderer from '@/pages/FileSharing/FilePreview/FileRenderer';
import ResizableWindow from '@/components/framing/ResizableWindow/ResizableWindow';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import FILE_PREVIEW_ELEMENT_ID from '@libs/filesharing/constants/filePreviewElementId';
import useWindowResize from '@/hooks/useWindowResize';
import OpenInNewTabButton from '@/components/framing/ResizableWindow/Buttons/OpenInNewTabButton';
import FILE_PREVIEW_ROUTE from '@libs/filesharing/constants/routes';
import EditButton from '@/components/framing/ResizableWindow/Buttons/EditButton';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';

const FileViewer = () => {
  const { t } = useTranslation();
  const { addFileToOpenInNewTab, currentlyEditingFile, fetchDownloadLinks, setCurrentlyEditingFile } =
    useFileEditorStore();
  const { setFileIsCurrentlyDisabled } = useFileSharingStore();
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const windowSize = useWindowResize();
  const [filePreviewRect, setFilePreviewRect] = useState<Pick<DOMRect, 'x' | 'y' | 'width' | 'height'> | null>(null);

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

  const openInNewTab = () => {
    if (currentlyEditingFile) {
      addFileToOpenInNewTab(currentlyEditingFile);
      window.open(`${FILE_PREVIEW_ROUTE}?file=${currentlyEditingFile.etag}`, '_blank');
      setCurrentlyEditingFile(null);
    }
  };

  useEffect(() => {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    if (currentlyEditingFile) {
      void fetchDownloadLinks(currentlyEditingFile, controller.signal);
    }

    return () => controller.abort();
  }, [currentlyEditingFile, isEditMode]);

  const handleCloseFile = async () => {
    if (!currentlyEditingFile) return;
    const { basename } = currentlyEditingFile;
    setIsEditMode(false);
    setCurrentlyEditingFile(null);
    await setFileIsCurrentlyDisabled(basename, true, 5000);
  };

  if (!filePreviewRect || !currentlyEditingFile) return null;

  const { x, y, width, height } = filePreviewRect;
  const isEditButtonVisible = !isEditMode && isOnlyOfficeDocument(currentlyEditingFile.filename);
  const additionalButtons = [
    <OpenInNewTabButton
      onClick={openInNewTab}
      key={OpenInNewTabButton.name}
    />,
    isEditButtonVisible ? (
      <EditButton
        onClick={() => setIsEditMode(true)}
        key={EditButton.name}
      />
    ) : null,
  ];

  return (
    <ResizableWindow
      disableMinimizeWindow
      titleTranslationId={currentlyEditingFile?.basename || t(`filesharing.filePreview`)}
      handleClose={handleCloseFile}
      initialPosition={{ x, y }}
      initialSize={{ width, height }}
      openMaximized={false}
      stickToInitialSizeAndPositionWhenRestored
      additionalButtons={additionalButtons}
    >
      <FileRenderer editMode={isEditMode} />
    </ResizableWindow>
  );
};

export default FileViewer;
