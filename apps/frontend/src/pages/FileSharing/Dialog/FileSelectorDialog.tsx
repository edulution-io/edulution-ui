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

import React from 'react';
import useOpenFileDialogStore from '@/pages/FileSharing/useOpenFileDialogStore';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';
import { useTranslation } from 'react-i18next';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import useWhiteboardEditorStore from '@/pages/Whiteboard/useWhiteboardEditorStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import ContentType from '@libs/filesharing/types/contentType';

const FileSelectorDialog = () => {
  const { isFileDialogOpen, setAllowedExtensions, setOpenFileDialog } = useOpenFileDialogStore();
  const { moveOrCopyItemToPath, setMoveOrCopyItemToPath } = useFileSharingDialogStore();
  const { createDownloadBlobUrl } = useFileSharingDownloadStore();
  const { openTldrFromBlobUrl } = useWhiteboardEditorStore();
  const { t } = useTranslation();
  const { selectedWebdavShare } = useFileSharingStore();
  const { allowedExtensions } = useOpenFileDialogStore();

  const fileHasAllowedExtension = (name: string) =>
    !allowedExtensions.length || allowedExtensions.some((ext) => name.toLowerCase().endsWith(ext.toLowerCase()));

  const handleClose = () => {
    setAllowedExtensions([]);
    setMoveOrCopyItemToPath({} as DirectoryFileDTO);
    setOpenFileDialog(false);
  };

  const handelSubmit = async () => {
    const blobUrl = await createDownloadBlobUrl(moveOrCopyItemToPath.filePath, selectedWebdavShare);
    if (blobUrl) {
      await openTldrFromBlobUrl(blobUrl, moveOrCopyItemToPath.filename);
    }
    handleClose();
    return [];
  };

  const getDialog = () => (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch=""
      showSelectedFile
      fileType={ContentType.FILE}
      enableRowSelection={(row) =>
        row.original.type === ContentType.FILE && fileHasAllowedExtension(row.original.filename)
      }
      getRowDisabled={(row) =>
        row.original.type === ContentType.FILE && !fileHasAllowedExtension(row.original.filename)
      }
    />
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={handleClose}
      handleSubmit={handelSubmit}
      submitButtonText="common.open"
      submitButtonType="submit"
      disableSubmit={!moveOrCopyItemToPath?.filePath}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isFileDialogOpen}
      title={t('fileSelectorDialogBody.title')}
      body={getDialog()}
      footer={getFooter()}
      handleOpenChange={handleClose}
    />
  );
};

export default FileSelectorDialog;
