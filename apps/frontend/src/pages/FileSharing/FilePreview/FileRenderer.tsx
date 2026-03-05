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

import React, { FC, MutableRefObject, ReactNode, useEffect } from 'react';
import ImageComponent from '@/components/ui/ImageComponent';
import MediaComponent from '@/components/ui/MediaComponent';
import OnlyOffice from '@/pages/FileSharing/FilePreview/OnlyOffice/OnlyOffice';
import Collabora from '@/pages/FileSharing/FilePreview/Collabora/Collabora';
import DrawioViewer from '@/pages/FileSharing/FilePreview/DrawioViewer/DrawioViewer';
import { t } from 'i18next';
import isImageExtension from '@libs/filesharing/utils/isImageExtension';
import isMediaExtension from '@libs/filesharing/utils/isMediaExtension';
import isTextExtension from '@libs/filesharing/utils/isTextExtension';
import isDrawioExtension from '@libs/filesharing/utils/isDrawioExtension';
import isOfficeDocument from '@libs/filesharing/utils/isOfficeDocument';
import TEXT_EXTENSIONS from '@libs/filesharing/types/textExtensions';
import useMedia from '@/hooks/useMedia';
import getFileExtension from '@libs/filesharing/utils/getFileExtension';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import PdfViewer from '@/components/shared/PDFViewer/PdfViewer';
import TextPreview from '@/components/ui/Renderer/TextPreview';
import MarkdownRenderer from '@/components/ui/Renderer/MarkdownRenderer';
import useFileContentPreviewStore from '@/pages/FileSharing/FilePreview/useFileContentPreviewStore';
import useFileEditorContentStore from '@/pages/FileSharing/FilePreview/useFileEditorContentStore';
import { FILE_PREVIEW_TYPE, FilePreviewType } from '@libs/filesharing/types/filePreviewType';
import isPdfExtension from '@libs/filesharing/utils/isPdfExtension';
import isVideoExtension from '@libs/filesharing/utils/isVideoExtension';
import { cn } from '@edulution-io/ui-kit';
import TEXT_PREVIEW_ELEMENT_ID from '@libs/filesharing/constants/textPreviewElementId';

interface FileRendererProps {
  editMode: boolean;
  isOpenedInNewTab?: boolean;
  closingRef?: MutableRefObject<boolean>;
  isOnlyOfficeConfigured?: boolean;
  isCollaboraConfigured?: boolean;
  webdavShare?: string;
}

const FileRenderer: FC<FileRendererProps> = ({
  editMode,
  isOpenedInNewTab,
  closingRef,
  isOnlyOfficeConfigured,
  isCollaboraConfigured,
  webdavShare,
}) => {
  const { isMobileView } = useMedia();
  const {
    temporaryDownloadUrl: fileUrl,
    publicDownloadLink,
    isEditorLoading,
    isCreatingBlobUrl,
    isFetchingPublicUrl,
    error,
  } = useFileSharingDownloadStore();

  const { currentlyEditingFile } = useFileEditorStore();
  const { setFileIsCurrentlyDisabled } = useFileSharingStore();
  const { fileContent, isLoadingContent, fetchFileContent, reset: resetContentPreview } = useFileContentPreviewStore();
  const { editedContent, setEditedContent, setOriginalContent } = useFileEditorContentStore();

  const fileExtension = currentlyEditingFile ? getFileExtension(currentlyEditingFile.filePath) : undefined;
  const isMarkdown = fileExtension === TEXT_EXTENSIONS.MD || fileExtension === TEXT_EXTENSIONS.MARKDOWN;
  const isText = isTextExtension(fileExtension);
  const isDrawio = isDrawioExtension(fileExtension);
  const isTextBasedFile = isText || isDrawio;
  const isBaseLoading = isEditorLoading || isCreatingBlobUrl || isFetchingPublicUrl || !!error;

  useEffect(() => {
    if (currentlyEditingFile && !isEditorLoading && !isCreatingBlobUrl && !isFetchingPublicUrl) {
      void setFileIsCurrentlyDisabled(currentlyEditingFile.filename, false);
    }
  }, [isEditorLoading, isCreatingBlobUrl, isFetchingPublicUrl, currentlyEditingFile?.filename]);

  useEffect(
    () => () => {
      if (!closingRef?.current && currentlyEditingFile) {
        void setFileIsCurrentlyDisabled(currentlyEditingFile.filename, false);
      }
    },
    [currentlyEditingFile?.filename],
  );

  useEffect(() => {
    if (!isTextBasedFile || !fileUrl) {
      resetContentPreview();
      return undefined;
    }

    const abortController = new AbortController();
    void fetchFileContent(fileUrl, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [fileUrl, isTextBasedFile]);

  useEffect(() => {
    if (editMode && isTextBasedFile && fileContent !== null) {
      setOriginalContent(fileContent);
    }
  }, [editMode, isTextBasedFile, fileContent, setOriginalContent]);

  if (!currentlyEditingFile) return null;

  const getFileType = (): FilePreviewType => {
    if (isPdfExtension(fileExtension)) return FILE_PREVIEW_TYPE.PDF;

    const isEditableDoc = isOfficeDocument(currentlyEditingFile.filePath);
    if (isEditableDoc && isOnlyOfficeConfigured) return FILE_PREVIEW_TYPE.ONLY_OFFICE;
    if (isEditableDoc && isCollaboraConfigured) return FILE_PREVIEW_TYPE.COLLABORA;

    if (isDrawioExtension(fileExtension)) return FILE_PREVIEW_TYPE.DRAWIO;
    if (isImageExtension(fileExtension)) return FILE_PREVIEW_TYPE.IMAGE;
    if (isMediaExtension(fileExtension)) return FILE_PREVIEW_TYPE.MEDIA;
    if (isText) return FILE_PREVIEW_TYPE.TEXT;

    return FILE_PREVIEW_TYPE.UNSUPPORTED;
  };

  const renderContent = (): ReactNode => {
    const fileType = getFileType();

    switch (fileType) {
      case FILE_PREVIEW_TYPE.PDF:
        if (isBaseLoading || !fileUrl) return <CircleLoader className="mx-auto mt-5" />;
        return (
          <PdfViewer
            fetchUrl={fileUrl}
            containerClassName={isOpenedInNewTab ? 'h-dvh' : 'h-full'}
          />
        );

      case FILE_PREVIEW_TYPE.ONLY_OFFICE:
        if (isBaseLoading || !publicDownloadLink) return <CircleLoader className="mx-auto mt-5" />;
        return (
          <OnlyOffice
            url={publicDownloadLink}
            fileName={currentlyEditingFile.filename}
            filePath={currentlyEditingFile.filePath}
            mode={editMode ? 'edit' : 'view'}
            type={isMobileView ? 'mobile' : 'desktop'}
            isOpenedInNewTab={isOpenedInNewTab}
            webdavShare={webdavShare}
          />
        );

      case FILE_PREVIEW_TYPE.COLLABORA:
        return (
          <Collabora
            filePath={currentlyEditingFile.filePath}
            editMode={editMode}
            isOpenedInNewTab={isOpenedInNewTab}
            webdavShare={webdavShare}
          />
        );

      case FILE_PREVIEW_TYPE.DRAWIO:
        if (isBaseLoading || isLoadingContent || fileContent === null) return <CircleLoader className="mx-auto mt-5" />;
        return (
          <DrawioViewer
            xmlContent={fileContent}
            editMode={editMode}
            isFullscreen={isOpenedInNewTab}
            webdavShare={webdavShare}
          />
        );

      case FILE_PREVIEW_TYPE.IMAGE:
        if (isBaseLoading || !fileUrl) return <CircleLoader className="mx-auto mt-5" />;
        return (
          <ImageComponent
            key={fileUrl}
            downloadLink={fileUrl}
            altText="Image"
          />
        );

      case FILE_PREVIEW_TYPE.MEDIA:
        if (isBaseLoading || !fileUrl) return <CircleLoader className="mx-auto mt-5" />;
        return (
          <MediaComponent
            key={fileUrl}
            url={fileUrl}
            isVideo={isVideoExtension(fileExtension)}
            height={isOpenedInNewTab ? '100dvh' : '100%'}
          />
        );

      case FILE_PREVIEW_TYPE.TEXT: {
        if (isBaseLoading || !fileUrl || isLoadingContent || fileContent === null)
          return <CircleLoader className="mx-auto mt-5" />;

        return (
          <div className={isOpenedInNewTab ? 'h-dvh' : 'h-full overflow-auto'}>
            {isMarkdown || editMode ? (
              <MarkdownRenderer
                content={editedContent ?? fileContent}
                editable={editMode}
                showToolbar={isMarkdown}
                showPreview={isMarkdown}
                onChange={setEditedContent}
                className={cn('h-full bg-foreground', { 'p-4': !editMode })}
                contentId={TEXT_PREVIEW_ELEMENT_ID}
              />
            ) : (
              <TextPreview
                content={fileContent}
                contentId={TEXT_PREVIEW_ELEMENT_ID}
              />
            )}
          </div>
        );
      }

      default:
        return <p>{t('filesharing.errors.FileFormatNotSupported')}</p>;
    }
  };

  return renderContent();
};

export default FileRenderer;
