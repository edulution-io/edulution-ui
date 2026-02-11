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

import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FileActionType from '@libs/filesharing/types/fileActionType';
import TableAction from '@libs/frontend/common/types/tableAction';
import { faCopy, faDownload, faFileExport, faPenToSquare, faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { DeleteIcon } from '@libs/frontend/common/constants/standardActionIcons';

interface FileSharingActionCallbacks {
  openDialog: (action: FileActionType) => void;
  setSelectedItems: (items: DirectoryFileDTO[]) => void;
  startDownload: (items: DirectoryFileDTO[]) => Promise<void>;
}

const getFileSharingActions = (
  item: DirectoryFileDTO,
  callbacks: FileSharingActionCallbacks,
): TableAction<DirectoryFileDTO>[] => {
  const { openDialog, setSelectedItems, startDownload } = callbacks;

  const handleAction = (action: FileActionType) => {
    setSelectedItems([item]);
    openDialog(action);
  };

  return [
    {
      icon: faFileExport,
      translationId: 'tooltip.move',
      onClick: () => handleAction(FileActionType.MOVE_FILE_OR_FOLDER),
    },
    {
      icon: faPenToSquare,
      translationId: 'tooltip.rename',
      onClick: () => handleAction(FileActionType.RENAME_FILE_OR_FOLDER),
    },
    {
      icon: faCopy,
      translationId: 'tooltip.copy',
      onClick: () => handleAction(FileActionType.COPY_FILE_OR_FOLDER),
    },
    {
      icon: faDownload,
      translationId: 'tooltip.download',
      onClick: () => {
        void startDownload([item]);
      },
    },
    {
      icon: faShareNodes,
      translationId: 'tooltip.share',
      onClick: () => handleAction(FileActionType.SHARE_FILE_OR_FOLDER),
    },
    {
      icon: DeleteIcon,
      translationId: 'common.delete',
      onClick: () => handleAction(FileActionType.DELETE_FILE_OR_FOLDER),
    },
  ];
};

export default getFileSharingActions;
