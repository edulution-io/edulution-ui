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

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { DndContext, DragOverlay, rectIntersection } from '@dnd-kit/core';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import TableGridView from '@/components/ui/Table/TableGridView';
import { GridItemConfig } from '@/components/ui/Table/GridView/GridView';
import useMedia from '@/hooks/useMedia';
import getFileSharingTableColumns from '@/pages/FileSharing/Table/getFileSharingTableColumns';
import FILE_SHARING_TABLE_COLUMNS from '@libs/filesharing/constants/fileSharingTableColumns';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import useAppConfigsStore from '@/pages/Settings/AppConfig/useAppConfigsStore';
import getExtendedOptionsValue from '@libs/appconfig/utils/getExtendedOptionsValue';
import APPS from '@libs/appconfig/constants/apps';
import ExtendedOptionKeys from '@libs/appconfig/constants/extendedOptionKeys';
import ContentType from '@libs/filesharing/types/contentType';
import { GRID_ICON_SIZE, TABLE_ICON_SIZE } from '@libs/ui/constants';
import VIEW_MODE from '@libs/common/constants/viewMode';
import useFileSharingDragAndDrop from '@/pages/FileSharing/hooks/useFileSharingDragAndDrop';
import PARENT_FOLDER_PATH from '@libs/filesharing/constants/parentFolderPath';
import { getElapsedTime } from '@/pages/FileSharing/utilities/filesharingUtilities';
import getFileCategory from '@libs/filesharing/utils/getFileCategory';
import FileEntryIcon from '@/pages/FileSharing/utilities/FileEntryIcon';
import TableActionMenu from '@/components/ui/Table/TableActionMenu';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import useStartWebdavFileDownload from '@/pages/FileSharing/hooks/useStartWebdavFileDownload';
import getFileSharingActions from '@/pages/FileSharing/Table/getFileSharingActions';
import isHiddenFile from '@libs/filesharing/utils/isHiddenFile';
import isSystemFile from '@libs/filesharing/utils/isSystemFile';
import useTableViewSettingsStore from '@/store/useTableViewSettingsStore';
import FILE_CATEGORIES from '@libs/filesharing/constants/fileCategories';
import type { FileCategory } from '@libs/filesharing/types/fileCategory';
import type FilterOption from '@libs/ui/types/filterOption';
import useFileOpen from '../hooks/useFileOpen';
import useVariableSharePathname from '../hooks/useVariableSharePathname';
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';

const FileSharingTable = () => {
  const { webdavShare } = useParams();
  const { isMobileView, isTabletView } = useMedia();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);
  const { setSelectedRows, setSelectedItems, fetchFiles, selectedRows, files, isLoading, currentPath, webdavShares } =
    useFileSharingStore();

  const { t } = useTranslation();

  const { sensors, draggedFiles, handleDragStart, handleDragEnd, handleDragCancel, canDropOnRow } =
    useFileSharingDragAndDrop({
      webdavShare,
      currentPath,
    });
  const { createVariableSharePathname } = useVariableSharePathname();
  const {
    showSystemFiles,
    showHiddenFiles,
    setShowSystemFiles,
    setShowHiddenFiles,
    getViewMode,
    fileCategoryFilters,
    setFileCategoryFilter,
  } = useTableViewSettingsStore((state) => ({
    showSystemFiles: state.showSystemFiles?.[APPS.FILE_SHARING] ?? false,
    showHiddenFiles: state.showHiddenFiles?.[APPS.FILE_SHARING] ?? false,
    setShowSystemFiles: state.setShowSystemFiles,
    setShowHiddenFiles: state.setShowHiddenFiles,
    getViewMode: state.getViewMode,
    fileCategoryFilters: state.getFileCategoryFilters(APPS.FILE_SHARING),
    setFileCategoryFilter: state.setFileCategoryFilter,
  }));

  const viewMode = getViewMode(APPS.FILE_SHARING);
  const isGridView = viewMode === VIEW_MODE.grid;

  const isDocumentServerConfigured = !!getExtendedOptionsValue(
    appConfigs,
    APPS.FILE_SHARING,
    ExtendedOptionKeys.ONLY_OFFICE_URL,
  );

  const { handleFileOpen } = useFileOpen({ isDocumentServerConfigured });
  const { openDialog } = useFileSharingDialogStore();
  const startDownload = useStartWebdavFileDownload();

  useEffect(() => {
    if (currentPath !== '/') void fetchFiles(webdavShare, currentPath);
  }, []);

  const columns = useMemo(
    () => getFileSharingTableColumns(undefined, undefined, isDocumentServerConfigured),
    [isDocumentServerConfigured],
  );

  const filesByPath = useMemo(() => {
    const map = new Map<string, DirectoryFileDTO>();
    files.forEach((file) => map.set(file.filePath, file));
    return map;
  }, [files]);

  const handleRowSelectionChange: OnChangeFn<RowSelectionState> = useCallback(
    (updaterOrValue) => {
      const newValue =
        typeof updaterOrValue === 'function'
          ? updaterOrValue(useFileSharingStore.getState().selectedRows)
          : updaterOrValue;

      const filteredValue = Object.keys(newValue).reduce((acc, key) => {
        if (key !== PARENT_FOLDER_PATH && newValue[key]) {
          acc[key] = newValue[key];
        }
        return acc;
      }, {} as RowSelectionState);

      setSelectedRows(filteredValue);

      const selectedItemData = Object.keys(filteredValue)
        .filter((key) => filteredValue[key])
        .map((rowId) => filesByPath.get(rowId))
        .filter(Boolean) as DirectoryFileDTO[];

      setSelectedItems(selectedItemData);
    },
    [filesByPath, setSelectedRows, setSelectedItems],
  );

  const shouldShowExtraColumns = !(isMobileView || isTabletView || (isFilePreviewVisible && isFilePreviewDocked));

  const initialColumnVisibility = useMemo(
    () => ({
      [FILE_SHARING_TABLE_COLUMNS.LAST_MODIFIED]: shouldShowExtraColumns,
      [FILE_SHARING_TABLE_COLUMNS.SIZE]: shouldShowExtraColumns,
      [FILE_SHARING_TABLE_COLUMNS.TYPE]: shouldShowExtraColumns,
      [FILE_SHARING_TABLE_COLUMNS.IS_SHARED]: shouldShowExtraColumns,
    }),
    [shouldShowExtraColumns],
  );

  const actionCallbacks = useMemo(
    () => ({
      openDialog,
      setSelectedItems,
      startDownload,
    }),
    [openDialog, setSelectedItems, startDownload],
  );

  const gridItemConfig: GridItemConfig<DirectoryFileDTO> = useMemo(
    () => ({
      renderIcon: (item) => (
        <FileEntryIcon
          file={item}
          size={GRID_ICON_SIZE}
        />
      ),
      renderTitle: (item) => item.filename,
      renderSubtitle: (item) => {
        if (item.filePath === PARENT_FOLDER_PATH || !item.lastmod) return undefined;
        return getElapsedTime(new Date(item.lastmod));
      },
      renderContextMenu: (item) => {
        if (item.filePath === PARENT_FOLDER_PATH) return null;
        const actions = getFileSharingActions(item, actionCallbacks);
        return (
          <TableActionMenu
            actions={actions}
            trigger={
              <button
                type="button"
                className="rounded p-1 hover:bg-muted"
              >
                <FontAwesomeIcon
                  icon={faEllipsisVertical}
                  className="h-5 w-5"
                />
              </button>
            }
          />
        );
      },
    }),
    [actionCallbacks],
  );

  const filteredFiles = useMemo(
    () =>
      files.filter((file) => {
        if (file.filePath === currentPath) return false;
        if (isSystemFile(file.filename) && !showSystemFiles) return false;
        if (isHiddenFile(file.filename) && !showHiddenFiles) return false;

        const category = file.type === ContentType.DIRECTORY ? FILE_CATEGORIES.FOLDER : getFileCategory(file.filename);
        return fileCategoryFilters[category as FileCategory];
      }),
    [files, showSystemFiles, showHiddenFiles, fileCategoryFilters, currentPath],
  );

  const filesWithParentNav = useMemo(() => {
    if (!webdavShare || currentPath === '/') {
      return filteredFiles;
    }

    const currentShare = webdavShares.find((s) => s.displayName === webdavShare);
    const baseSharePath = currentShare?.pathname || `/${webdavShare}`;
    const shareRootPath = createVariableSharePathname(baseSharePath, currentShare?.pathVariables);

    if (currentPath === shareRootPath || currentPath === `/${shareRootPath}`) {
      return filteredFiles;
    }

    const parentEntry: DirectoryFileDTO = {
      filePath: PARENT_FOLDER_PATH,
      filename: '..',
      type: ContentType.DIRECTORY,
      etag: '',
    };

    return [parentEntry, ...filteredFiles];
  }, [filteredFiles, currentPath, webdavShare, webdavShares, createVariableSharePathname]);

  const [sortedFiles, setSortedFiles] = useState<DirectoryFileDTO[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSortedRowsChange = useCallback((rows: DirectoryFileDTO[]) => {
    setSortedFiles(rows);
  }, []);

  const { focusedFile, handleItemClick } = useKeyboardNavigation({
    files: sortedFiles,
    onFileOpen: handleFileOpen,
    isGridView,
    containerRef,
  });

  const categoryFilterOptions: FilterOption[] = useMemo(
    () =>
      Object.values(FILE_CATEGORIES).map((category) => ({
        key: `category-${category}`,
        translationKey: `fileCategory.${category}`,
        checked: fileCategoryFilters[category],
        onChange: (enabled: boolean) => setFileCategoryFilter(APPS.FILE_SHARING, category, enabled),
      })),
    [fileCategoryFilters, setFileCategoryFilter],
  );

  const filterOptions: FilterOption[] = useMemo(
    () => [
      {
        key: 'showSystemFiles',
        translationKey: 'common.showSystemFiles',
        checked: showSystemFiles,
        onChange: (enabled: boolean) => setShowSystemFiles(APPS.FILE_SHARING, enabled),
      },
      {
        key: 'showHiddenFiles',
        translationKey: 'common.showHiddenFiles',
        checked: showHiddenFiles,
        onChange: (enabled: boolean) => setShowHiddenFiles(APPS.FILE_SHARING, enabled),
      },
      {
        key: 'separator',
        translationKey: '',
        checked: false,
        onChange: () => {},
        isSeparator: true,
      },
      ...categoryFilterOptions,
    ],
    [showSystemFiles, showHiddenFiles, setShowSystemFiles, setShowHiddenFiles, categoryFilterOptions],
  );

  return (
    <div
      ref={containerRef}
      className="flex h-full flex-col"
    >
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        collisionDetection={rectIntersection}
      >
        <TableGridView
          columns={columns}
          data={filesWithParentNav}
          filterKey={FILE_SHARING_TABLE_COLUMNS.SELECT_FILENAME}
          filterPlaceHolderText="filesharing.filterPlaceHolderText"
          onRowSelectionChange={handleRowSelectionChange}
          isLoading={isLoading}
          selectedRows={selectedRows}
          getRowId={(row) => row.filePath}
          getRowDisabled={(row) => row.original.filePath === PARENT_FOLDER_PATH}
          getRowExcludedFromCount={(row) => row.original.filePath === PARENT_FOLDER_PATH}
          enableRowSelection={(row) => row.original.filePath !== PARENT_FOLDER_PATH}
          applicationName={APPS.FILE_SHARING}
          initialSorting={[{ id: 'select-filename', desc: false }]}
          initialColumnVisibility={initialColumnVisibility}
          enableDragAndDrop
          canDropOnRow={canDropOnRow}
          gridItemConfig={gridItemConfig}
          viewModeStorageKey={APPS.FILE_SHARING}
          filterOptions={filterOptions}
          focusedRowId={focusedFile?.filePath ?? null}
          onGridItemClick={handleItemClick}
          onSortedRowsChange={handleSortedRowsChange}
          pinnedToTopRowId={PARENT_FOLDER_PATH}
        />
        <DragOverlay>
          {draggedFiles.length > 0 && (
            <div className="flex w-fit items-center gap-2 rounded bg-accent p-2 shadow-lg">
              {draggedFiles.length === 1 ? (
                <>
                  <FileEntryIcon
                    file={draggedFiles[0]}
                    size={TABLE_ICON_SIZE}
                  />
                  <span className="truncate">{draggedFiles[0].filename}</span>
                </>
              ) : (
                <>
                  <div className="relative">
                    <FileEntryIcon
                      file={draggedFiles[0]}
                      size={TABLE_ICON_SIZE}
                    />
                    <div className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {draggedFiles.length}
                    </div>
                  </div>
                  <span className="truncate">
                    {draggedFiles.length} {t('fileSharingTable.elements')}
                  </span>
                </>
              )}
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default FileSharingTable;
