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

import React, { useRef, useCallback, useEffect, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@edulution-io/ui-kit';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import ContentType from '@libs/filesharing/types/contentType';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

interface ChatFileSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelected: (file: File) => void;
}

const ChatFileSelectorDialog: React.FC<ChatFileSelectorDialogProps> = ({ isOpen, onClose, onFileSelected }) => {
  const { t } = useTranslation();
  const { moveOrCopyItemToPath, setMoveOrCopyItemToPath } = useFileSharingDialogStore();
  const { createDownloadBlobUrl } = useFileSharingDownloadStore();
  const { selectedWebdavShare, webdavShares, fetchWebdavShares } = useFileSharingStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && webdavShares.length === 0) {
      void fetchWebdavShares();
    }
  }, [isOpen, webdavShares.length, fetchWebdavShares]);

  const handleClose = () => {
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    onClose();
  };

  const handleSubmit = async () => {
    const blobUrl = await createDownloadBlobUrl(moveOrCopyItemToPath.filePath, selectedWebdavShare);
    if (blobUrl) {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const file = new File([blob], moveOrCopyItemToPath.filename, { type: blob.type });
      URL.revokeObjectURL(blobUrl);
      onFileSelected(file);
    }
    handleClose();
  };

  const handleLocalFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (file) {
        onFileSelected(file);
        handleClose();
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileSelected],
  );

  const body =
    webdavShares.length > 0 ? (
      <MoveContentDialogBody
        showAllFiles
        pathToFetch=""
        showSelectedFile
        fileType={ContentType.FILE}
        enableRowSelection={(row) => row.original.type === ContentType.FILE}
      />
    ) : null;

  const footer = (
    <div className="flex w-full items-center justify-between">
      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleLocalFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="btn-outline"
          size="lg"
          onClick={() => fileInputRef.current?.click()}
        >
          <FontAwesomeIcon
            icon={faUpload}
            className="mr-2 h-3.5 w-3.5"
          />
          {t('chat.selectLocalFile')}
        </Button>
      </div>
      <DialogFooterButtons
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        submitButtonText="common.open"
        submitButtonType="submit"
        disableSubmit={!moveOrCopyItemToPath?.filePath}
      />
    </div>
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      title={t('fileSelectorDialogBody.title')}
      body={body}
      footer={footer}
      handleOpenChange={handleClose}
    />
  );
};

export default ChatFileSelectorDialog;
