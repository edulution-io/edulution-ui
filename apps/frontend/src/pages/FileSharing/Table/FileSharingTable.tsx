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
import { Copy, Download, FolderInput, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useStartWebdavFileDownload from '@/pages/FileSharing/hooks/useStartWebdavFileDownload';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import FileActionType from '@libs/filesharing/types/fileActionType';
import { VscShare } from 'react-icons/vsc';

const FileSharingTable = () => {
  const { webdavShare } = useParams();

  const { isMobileView, isTabletView } = useMedia();
  const { isFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
  const appConfigs = useAppConfigsStore((s) => s.appConfigs);
  const { setSelectedRows, setSelectedItems, fetchFiles, selectedRows, files, isLoading, currentPath } =
    useFileSharingStore();

  const startDownload = useStartWebdavFileDownload();

  const { openDialog } = useFileSharingDialogStore();

  const { t } = useTranslation();

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

  const contextMenuActions = useMemo(
    () => [
      {
        label: t('tooltip.download'),
        icon: <Download className="h-4 w-4" />,
        onClick: async (row: DirectoryFileDTO) => startDownload([row]),
        separator: true,
      },
      {
        label: t('tooltip.copy'),
        icon: <Copy className="h-4 w-4" />,
        onClick: () => {
          openDialog(FileActionType.COPY_FILE_OR_FOLDER);
        },
        separator: true,
      },
      {
        label: t('tooltip.move'),
        icon: <FolderInput className="h-4 w-4" />,
        onClick: () => {
          openDialog(FileActionType.MOVE_FILE_OR_FOLDER);
        },
        separator: true,
      },
      {
        label: t('tooltip.rename'),
        icon: <Pencil className="h-4 w-4" />,
        onClick: () => {
          openDialog(FileActionType.RENAME_FILE_OR_FOLDER);
        },
        separator: true,
      },
      {
        label: t('tooltip.share'),
        icon: <VscShare className="h-4 w-4" />,
        onClick: () => {
          openDialog(FileActionType.SHARE_FILE_OR_FOLDER);
        },
        separator: true,
      },
      {
        label: t('common.delete'),
        icon: <Trash2 className="h-4 w-4 text-red-500" />,
        onClick: () => {
          openDialog(FileActionType.DELETE_FILE_OR_FOLDER);
        },
        className: 'text-red-500',
      },
    ],
    [],
  );

  return (
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
      contextMenuActions={contextMenuActions}
    />
  );
};

export default FileSharingTable;
