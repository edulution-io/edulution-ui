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
import { useNavigate } from 'react-router-dom';
import { t } from 'i18next';
import AdaptiveDialog from '@/components/ui/AdaptiveDialog';
import MoveContentDialogBody from '@/pages/FileSharing/Dialog/DialogBodys/MoveContentDialogBody';
import ShareCollectDialogProps from '@libs/classManagement/types/shareCollectDialogProps';
import useUserPath from '@/pages/FileSharing/hooks/useUserPath';
import FILE_PATHS from '@libs/filesharing/constants/file-paths';
import DialogFooterButtons from '@/components/ui/DialogFooterButtons';

const ShowCollectedFilesDialog: React.FC<ShareCollectDialogProps> = ({ title, isOpen, onClose }) => {
  const { homePath } = useUserPath();
  const navigate = useNavigate();
  const collectedFilesPath = `${homePath}/${FILE_PATHS.TRANSFER}/${FILE_PATHS.COLLECTED}`;

  const getDialogBody = () => (
    <MoveContentDialogBody
      showAllFiles
      pathToFetch={collectedFilesPath}
      showSelectedFile={false}
      showRootOnly
    />
  );

  const getFooter = () => (
    <DialogFooterButtons
      handleClose={onClose}
      handleSubmit={() => {
        navigate(`/filesharing?path=${collectedFilesPath}`);
      }}
      submitButtonText={`classmanagement.${title}`}
    />
  );

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      handleOpenChange={onClose}
      title={t(`classmanagement.${title}`)}
      body={getDialogBody()}
      footer={getFooter()}
    />
  );
};

export default ShowCollectedFilesDialog;
