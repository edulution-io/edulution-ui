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

import React, { useEffect, useMemo } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import ScrollableTable from '@/components/ui/Table/ScrollableTable';
import useMedia from '@/hooks/useMedia';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import FILE_SHARING_TABLE_COLUMNS from '@libs/filesharing/constants/fileSharingTableColumns';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import { useParams } from 'react-router-dom';
import ContentType from '@libs/filesharing/types/contentType';
import { FcFolder } from 'react-icons/fc';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import useFileSharingDragAndDrop from '@/pages/FileSharing/hooks/useFileSharingDragAndDrop';
import { useTranslation } from 'react-i18next';

const FileSharingTable = () => {
  const { webdavShare } = useParams();
  const { isMobileView, isTabletView } = useMedia();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);
  const { setSelectedRows, setSelectedItems, fetchFiles, selectedRows, files, isLoading, currentPath } =
    useFileSharingStore();

  const { t } = useTranslation();

  const { sensors, draggedFiles, handleDragStart, handleDragEnd, handleDragCancel, canDropOnRow } =
    useFileSharingDragAndDrop({
      webdavShare,
      currentPath,
    });

  useEffect(() => {
    if (currentPath !== '/') void fetchFiles(webdavShare, currentPath);
  }, []);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = (updaterOrValue) => {
    const newValue =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(useFileSharingStore.getState().selectedRows)
        : updaterOrValue;
    setSelectedRows(newValue);
    const selectedItemData = Object.keys(newValue)
      .filter((key) => newValue[key])
      .map((rowId) => files.find((file) => file.filePath === rowId))
      .filter(Boolean) as DirectoryFileDTO[];
    setSelectedItems(selectedItemData);
  };

  const shouldHideColumns = !(isMobileView || isTabletView || (isFilePreviewVisible && isFilePreviewDocked));

  const initialColumnVisibility = useMemo(
    () => ({
      [FILE_SHARING_TABLE_COLUMNS.LAST_MODIFIED]: shouldHideColumns,
      [FILE_SHARING_TABLE_COLUMNS.SIZE]: shouldHideColumns,
      [FILE_SHARING_TABLE_COLUMNS.TYPE]: shouldHideColumns,
      [FILE_SHARING_TABLE_COLUMNS.IS_SHARED]: shouldHideColumns,
    }),
    [shouldHideColumns],
  );

  const isDocumentServerConfigured = !!getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
      collisionDetection={rectIntersection}
    >
      <ScrollableTable
        columns={getFileSharingTableColumns(undefined, undefined, isDocumentServerConfigured)}
        data={files}
        filterKey={FILE_SHARING_TABLE_COLUMNS.SELECT_FILENAME}
        filterPlaceHolderText="filesharing.filterPlaceHolderText"
        onRowSelectionChange={handleRowSelectionChange}
        isLoading={isLoading}
        selectedRows={selectedRows}
        getRowId={(row) => row.filePath}
        applicationName={APPS.FILE_SHARING}
        initialSorting={[
          { id: 'type', desc: false },
          { id: 'select-filename', desc: false },
        ]}
        initialColumnVisibility={initialColumnVisibility}
        enableDragAndDrop
        canDropOnRow={canDropOnRow}
      />
      <DragOverlay>
        {draggedFiles.length > 0 ? (
          <div className="flex w-fit items-center gap-2 rounded bg-accent p-2 shadow-lg">
            {draggedFiles.length === 1 ? (
              <>
                {draggedFiles[0].type === ContentType.DIRECTORY ? (
                  <FcFolder className="size-5 shrink-0" />
                ) : (
                  <FileIconComponent
                    filename={draggedFiles[0].filePath}
                    size={Number(TABLE_ICON_SIZE)}
                  />
                )}
                <span className="truncate">{draggedFiles[0].filename}</span>
              </>
            ) : (
              <>
                <div className="relative">
                  {draggedFiles[0].type === ContentType.DIRECTORY ? (
                    <FcFolder className="size-5 shrink-0" />
                  ) : (
                    <FileIconComponent
                      filename={draggedFiles[0].filePath}
                      size={Number(TABLE_ICON_SIZE)}
                    />
                  )}
                  <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {draggedFiles.length}
                  </div>
                </div>
                <span className="truncate">
                  {draggedFiles.length}{' '}
                  {draggedFiles.length === 1 ? t('fileSharingTable.element') : 'fileSharingTable.elements'}
                </span>
              </>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default FileSharingTable;
