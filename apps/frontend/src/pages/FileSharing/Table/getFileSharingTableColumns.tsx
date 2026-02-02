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
import { ColumnDef, Row } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import cn from '@libs/common/utils/className';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import ContentType from '@libs/filesharing/types/contentType';
import FILE_SHARING_TABLE_COLUMNS from '@libs/filesharing/constants/fileSharingTableColumns';
import isValidFileToPreview from '@libs/filesharing/utils/isValidFileToPreview';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';
import PARENT_FOLDER_PATH from '@libs/filesharing/constants/parentFolderPath';
import FileActionType from '@libs/filesharing/types/fileActionType';
import i18n from '@/i18n';
import { formatBytes, getElapsedTime, parseDate } from '@/pages/FileSharing/utilities/filesharingUtilities';
import getFileCategory from '@libs/filesharing/utils/getFileCategory';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableCell from '@/components/ui/Table/SelectableCell';
import FileEntryIcon from '@/pages/FileSharing/utilities/FileEntryIcon';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import useMedia from '@/hooks/useMedia';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import IconWithCount from '@/components/shared/IconWithCount';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import TableActionCell from '@/components/ui/Table/TableActionCell';
import useStartWebdavFileDownload from '@/pages/FileSharing/hooks/useStartWebdavFileDownload';
import getFileSharingActions from '@/pages/FileSharing/Table/getFileSharingActions';

const SIZE_COLUMN_WIDTH = 'w-1/12 lg:w-3/12 md:w-1/12';
const TYPE_COLUMN_WIDTH = 'w-1/12 lg:w-1/12 md:w-1/12';

const getFileSharingTableColumns = (
  visibleColumns?: string[],
  onFilenameClick?: (item: Row<DirectoryFileDTO>) => void,
  isDocumentServerConfigured?: boolean,
): ColumnDef<DirectoryFileDTO>[] => {
  const allColumns: ColumnDef<DirectoryFileDTO>[] = [
    {
      id: FILE_SHARING_TABLE_COLUMNS.SELECT_FILENAME,

      header: ({ table, column }) => (
        <SortableHeader<DirectoryFileDTO, unknown>
          table={table}
          column={column}
        />
      ),
      meta: {
        translationId: 'fileSharingTable.filename',
      },
      accessorFn: (row) => row.type + row.filePath,
      cell: ({ row }) => {
        const [searchParams, setSearchParams] = useSearchParams();
        const { currentlyDisabledFiles, setFileIsCurrentlyDisabled } = useFileSharingStore();
        const { resetCurrentlyEditingFile, setIsFilePreviewVisible, isFilePreviewDocked } = useFileEditorStore();
        const { setPublicDownloadLink } = useFileSharingDownloadStore();
        const isCurrentlyDisabled = currentlyDisabledFiles[row.original.filename];
        const { isMobileView } = useMedia();
        const handleFilenameClick = () => {
          const isPdf = row.original.filename.toLowerCase().endsWith('.pdf');

          if (onFilenameClick) {
            onFilenameClick(row);
            return;
          }
          if (isCurrentlyDisabled) return;
          setPublicDownloadLink('');
          if (row.original.type === ContentType.DIRECTORY) {
            if (isFilePreviewDocked) setIsFilePreviewVisible(false);
            const newParams = new URLSearchParams(searchParams);

            if (row.original.filePath === PARENT_FOLDER_PATH) {
              const currentPath = searchParams.get(URL_SEARCH_PARAMS.PATH) || '/';
              const hadTrailingSlash = currentPath.endsWith('/') && currentPath !== '/';
              const pathParts = currentPath.split('/').filter(Boolean);
              let parentPath = pathParts.length > 1 ? `/${pathParts.slice(0, -1).join('/')}` : '/';
              if (hadTrailingSlash && parentPath !== '/') {
                parentPath += '/';
              }
              newParams.set(URL_SEARCH_PARAMS.PATH, parentPath);
            } else {
              newParams.set(URL_SEARCH_PARAMS.PATH, row.original.filePath);
            }

            setSearchParams(newParams);
            return;
          }

          if (!isValidFileToPreview(row.original)) {
            row.toggleSelected();
            return;
          }
          const isOnlyOfficeDoc = isOnlyOfficeDocument(row.original.filename);
          if (isOnlyOfficeDoc && !isDocumentServerConfigured && !isPdf) {
            row.toggleSelected();
            return;
          }
          if (isMobileView && isOnlyOfficeDoc && isDocumentServerConfigured && !isPdf) {
            row.toggleSelected();
            return;
          }
          if (isOnlyOfficeDoc || isPdf) {
            void setFileIsCurrentlyDisabled(row.original.filename, true, 5000);
          }

          setIsFilePreviewVisible(true);
          void resetCurrentlyEditingFile(row.original);
        };

        const isSaving = currentlyDisabledFiles[row.original.filename];

        return (
          <div className={cn('min-w-0 max-w-full overflow-hidden', isSaving && 'pointer-events-none opacity-50')}>
            <SelectableCell
              icon={
                <FileEntryIcon
                  file={row.original}
                  size={TABLE_ICON_SIZE}
                  isLoading={isCurrentlyDisabled}
                />
              }
              row={row}
              text={row.original.filename}
              onClick={handleFilenameClick}
            />
          </div>
        );
      },

      sortingFn: (rowA, rowB) => {
        const isDirectoryA = rowA.original.type === ContentType.DIRECTORY;
        const isDirectoryB = rowB.original.type === ContentType.DIRECTORY;
        if (isDirectoryA !== isDirectoryB) {
          return isDirectoryA ? -1 : 1;
        }
        return rowA.original.filename.localeCompare(rowB.original.filename);
      },
    },
    {
      id: FILE_SHARING_TABLE_COLUMNS.IS_SHARED,
      size: 50,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,
      meta: {
        translationId: 'fileSharingTable.isShared',
      },
      accessorFn: (row) => {
        const { shares } = usePublicShareStore.getState();
        return shares.some((share) => share.filePath === row.filePath);
      },
      cell: ({ row }) => {
        const { shares } = usePublicShareStore();
        const { openDialog } = useFileSharingDialogStore();
        const { setSelectedItems } = useFileSharingStore();

        const matchedShares = shares.filter((share) => share.filePath === row.original.filePath);

        const matchCount = matchedShares.length;
        const isShared = matchCount > 0;

        return (
          <div className="flex items-center justify-center">
            {isShared && (
              <IconWithCount
                icon={faCloud}
                className="text-background"
                count={matchCount}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItems([row.original]);
                  openDialog(FileActionType.SHARE_FILE_OR_FOLDER);
                }}
              />
            )}
          </div>
        );
      },
    },
    {
      accessorKey: FILE_SHARING_TABLE_COLUMNS.LAST_MODIFIED,
      size: 140,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,
      meta: {
        translationId: 'fileSharingTable.lastModified',
      },
      accessorFn: (row) => row.lastmod,
      cell: ({ row }) => {
        if (row.original.filePath === PARENT_FOLDER_PATH) {
          return null;
        }

        const formattedDate = row.original.lastmod
          ? getElapsedTime(new Date(row.original.lastmod))
          : 'Date not provided';

        return <span className="overflow-hidden text-ellipsis">{formattedDate}</span>;
      },
      sortingFn: (rowA, rowB) => {
        const dateA = parseDate(rowA.original.lastmod);
        const dateB = parseDate(rowB.original.lastmod);

        if (!dateA && !dateB) return 0;
        if (!dateA) return -1;
        if (!dateB) return 1;

        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      id: FILE_SHARING_TABLE_COLUMNS.SIZE,
      size: 130,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,
      meta: {
        translationId: 'fileSharingTable.size',
      },
      accessorFn: (row) => row.size ?? 0,
      cell: ({ row }) => {
        if (row.original.filePath === PARENT_FOLDER_PATH) {
          return null;
        }

        const fileSize = row.original.size ?? 0;
        return (
          <div className={SIZE_COLUMN_WIDTH}>
            <span className="text-right text-base text-span font-medium">{formatBytes(fileSize)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: FILE_SHARING_TABLE_COLUMNS.TYPE,
      size: 160,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,

      meta: {
        translationId: 'fileSharingTable.type',
      },

      cell: ({ row }) => {
        if (row.original.filePath === PARENT_FOLDER_PATH) {
          return null;
        }

        const { t } = useTranslation();

        const renderFileCategorize = (item: DirectoryFileDTO) => {
          if (row.original.type === ContentType.FILE) {
            return t(`fileCategory.${getFileCategory(item.filePath)}`);
          }
          return t('fileCategory.folder');
        };

        return (
          <div className={cn('hidden lg:flex', TYPE_COLUMN_WIDTH)}>
            <span className="text-right text-base font-medium">{renderFileCategorize(row.original)}</span>
          </div>
        );
      },
      sortingFn: (rowA, rowB) => {
        const getTranslatedCategory = (row: DirectoryFileDTO) => {
          if (row.type === ContentType.DIRECTORY) return i18n.t('fileCategory.folder');
          return i18n.t(`fileCategory.${getFileCategory(row.filePath)}`);
        };
        const categoryA = getTranslatedCategory(rowA.original);
        const categoryB = getTranslatedCategory(rowB.original);
        return categoryA.localeCompare(categoryB);
      },
    },
    {
      id: FILE_SHARING_TABLE_COLUMNS.ACTIONS,
      size: 50,
      header: () => null,
      cell: ({ row }) => {
        if (row.original.filePath === PARENT_FOLDER_PATH) {
          return null;
        }

        const { openDialog } = useFileSharingDialogStore();
        const { setSelectedItems } = useFileSharingStore();
        const startDownload = useStartWebdavFileDownload();

        const actions = getFileSharingActions(row.original, {
          openDialog,
          setSelectedItems,
          startDownload,
        });

        return (
          <TableActionCell
            actions={actions}
            row={row}
          />
        );
      },
    },
  ];

  if (visibleColumns) {
    return allColumns.filter((column) => visibleColumns.includes(column.id as string));
  }

  return allColumns;
};

export default getFileSharingTableColumns;
