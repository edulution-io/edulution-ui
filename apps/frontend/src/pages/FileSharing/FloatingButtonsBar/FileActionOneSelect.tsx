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

import React, { FC } from 'react';
import { t } from 'i18next';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FloatingButtonsBarConfig from '@libs/ui/types/FloatingButtons/floatingButtonsBarConfig';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';
import MoveButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/moveButton';
import DeleteButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/deleteButton';
import DownloadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/downloadButton';
import useStartWebdavFileDownload from '@/pages/FileSharing/hooks/useStartWebdavFileDownload';
import CopyButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/copyButton';
import ShareButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/shareButton';

const FileActionOneSelect: FC<FileActionButtonProps> = ({ openDialog, selectedItems }) => {
  const startDownload = useStartWebdavFileDownload();

  const config: FloatingButtonsBarConfig = {
    buttons: [
      DeleteButton(() => openDialog(FileActionType.DELETE_FILE_OR_FOLDER)),
      MoveButton(() => openDialog(FileActionType.MOVE_FILE_OR_FOLDER)),
      {
        icon: MdDriveFileRenameOutline,
        text: t('tooltip.rename'),
        onClick: () => openDialog(FileActionType.RENAME_FILE_OR_FOLDER),
      },
      DownloadButton(async () => {
        if (!selectedItems) return;
        await startDownload(selectedItems);
      }),
      CopyButton(() => openDialog(FileActionType.COPY_FILE_OR_FOLDER)),
      ShareButton(() => openDialog(FileActionType.SHARE_FILE_OR_FOLDER)),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};
export default FileActionOneSelect;
