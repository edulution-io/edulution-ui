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

import { useMemo, useState } from 'react';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FileSharingApiEndpoints from '@libs/filesharing/types/fileSharingApiEndpoints';
import { HttpMethods } from '@libs/common/types/http-methods';
import ContentType from '@libs/filesharing/types/contentType';
import PathChangeOrCreateDto from '@libs/filesharing/types/pathChangeOrCreateProps';
import { DragEndEvent, DragStartEvent, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';

interface UseFileSharingDragAndDropProps {
  webdavShare: string | undefined;
  currentPath: string;
}

const useFileSharingDragAndDrop = ({ webdavShare, currentPath }: UseFileSharingDragAndDropProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { handleItemAction } = useFileSharingDialogStore();
  const { setSelectedRows, setSelectedItems, fetchFiles, selectedRows, files } = useFileSharingStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const draggedFile = event.active.data.current as DirectoryFileDTO;
    if (draggedFile?.filePath === '__parent__') {
      return;
    }
    setActiveId(event.active.id as string);
  };

  const canDropOnRow = (file: DirectoryFileDTO) =>
    file.type === ContentType.DIRECTORY && file.filePath !== '__parent__';

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !webdavShare || active.id === over.id) {
      return;
    }

    const sourceFile = active.data.current as DirectoryFileDTO;
    const targetFolder = over.data.current as DirectoryFileDTO;

    const isDraggedFileSelected = selectedRows[sourceFile.filePath];

    const filesToMove = isDraggedFileSelected
      ? Object.keys(selectedRows)
          .filter((key) => selectedRows[key])
          .map((filePath) => {
            const file = files.find((f) => f.filePath === filePath);
            if (!file) return null;
            return {
              path: file.filePath,
              newPath: `${targetFolder.filePath}/${file.filename}`,
            };
          })
          .filter(Boolean)
      : [
          {
            path: sourceFile.filePath,
            newPath: `${targetFolder.filePath}/${sourceFile.filename}`,
          } as PathChangeOrCreateDto,
        ];

    await handleItemAction(
      FileActionType.MOVE_FILE_OR_FOLDER,
      `${FileSharingApiEndpoints.FILESHARING_ACTIONS}`,
      HttpMethods.PATCH,
      ContentType.FILE || ContentType.DIRECTORY,
      filesToMove as PathChangeOrCreateDto[],
      webdavShare,
    );

    setSelectedRows({});
    setSelectedItems([]);

    await fetchFiles(webdavShare, currentPath);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeFile = activeId ? files.find((file) => file.filePath === activeId) : null;

  const draggedFiles = useMemo(() => {
    if (!activeFile) return [];

    const isDraggedFileSelected = selectedRows[activeFile.filePath];

    if (isDraggedFileSelected) {
      return Object.keys(selectedRows)
        .filter((key) => selectedRows[key])
        .map((filePath) => files.find((f) => f.filePath === filePath))
        .filter(Boolean) as DirectoryFileDTO[];
    }

    return [activeFile];
  }, [activeFile, selectedRows, files]);

  return {
    sensors,
    activeId,
    draggedFiles,
    handleDragStart,
    handleDragEnd,
    handleDragCancel,
    canDropOnRow,
  };
};

export default useFileSharingDragAndDrop;
