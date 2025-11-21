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
import { FcFolder } from 'react-icons/fc';
import {
  formatBytes,
  getElapsedTime,
  getFileCategorie,
  parseDate,
} from '@/pages/FileSharing/utilities/filesharingUtilities';
import { useSearchParams } from 'react-router-dom';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { DirectoryFileDTO } from '@libs/filesharing/types/directoryFileDTO';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import { BUTTONS_ICON_WIDTH, TABLE_ICON_SIZE } from '@libs/ui/constants';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/Loading/CircleLoader';
import FILE_SHARING_TABLE_COLUMNS from '@libs/filesharing/constants/fileSharingTableColumns';
import isValidFileToPreview from '@libs/filesharing/utils/isValidFileToPreview';
import useMedia from '@/hooks/useMedia';
import useFileSharingDownloadStore from '@/pages/FileSharing/useFileSharingDownloadStore';
import { MdOutlineCloudDone } from 'react-icons/md';
import IconWithCount from '@/components/shared/IconWithCount';
import usePublicShareStore from '@/pages/FileSharing/publicShare/usePublicShareStore';
import useFileSharingDialogStore from '@/pages/FileSharing/Dialog/useFileSharingDialogStore';
import FileActionType from '@libs/filesharing/types/fileActionType';
import URL_SEARCH_PARAMS from '@libs/common/constants/url-search-params';
import isOnlyOfficeDocument from '@libs/filesharing/utils/isOnlyOfficeDocument';

const sizeColumnWidth = 'w-1/12 lg:w-3/12 md:w-1/12';
const typeColumnWidth = 'w-1/12 lg:w-1/12 md:w-1/12';

const renderFileIcon = (item: DirectoryFileDTO, isCurrentlyDisabled: boolean) => {
  if (isCurrentlyDisabled) {
    return (
      <CircleLoader
        height="h-6"
        width="w-6"
      />
    );
  }
  if (item.type === ContentType.FILE) {
    return (
      <FileIconComponent
        filename={item.filePath}
        size={Number(TABLE_ICON_SIZE)}
      />
    );
  }
  return <FcFolder size={TABLE_ICON_SIZE} />;
};

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

            if (row.original.filePath === '__parent__') {
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

          if (!isValidFileToPreview(row.original) || isMobileView) {
            row.toggleSelected();
            return;
          }
          const isOnlyOfficeDoc = isOnlyOfficeDocument(row.original.filename);
          if (isOnlyOfficeDoc && !isDocumentServerConfigured && !isPdf) {
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
          <div className={`w-full ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
            <SelectableTextCell
              icon={renderFileIcon(row.original, isCurrentlyDisabled)}
              row={row}
              text={row.original.filename}
              onClick={handleFilenameClick}
            />
          </div>
        );
      },

      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.type + rowA.original.filePath;
        const valueB = rowB.original.type + rowB.original.filePath;
        return valueA.localeCompare(valueB);
      },
    },
    {
      accessorKey: FILE_SHARING_TABLE_COLUMNS.IS_SHARED,
      size: 50,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,
      meta: {
        translationId: 'fileSharingTable.isShared',
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
                Icon={MdOutlineCloudDone}
                size={BUTTONS_ICON_WIDTH}
                className="text-background"
                count={matchCount}
                onClick={() => {
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
        if (row.original.filePath === '__parent__') {
          return null;
        }

        const directoryFile = row.original;
        let formattedDate: string;

        if (directoryFile.lastmod) {
          const date = new Date(directoryFile.lastmod);
          formattedDate = getElapsedTime(date);
        } else {
          formattedDate = 'Date not provided';
        }
        return <span className="overflow-hidden text-ellipsis">{formattedDate}</span>;
      },
      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.lastmod;
        const valueB = rowB.original.lastmod;

        const dateA = parseDate(valueA);
        const dateB = parseDate(valueB);

        if (!dateA || !dateB) {
          return !dateA ? -1 : 1;
        }

        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: FILE_SHARING_TABLE_COLUMNS.SIZE,
      size: 130,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,
      meta: {
        translationId: 'fileSharingTable.size',
      },
      cell: ({ row }) => {
        if (row.original.filePath === '__parent__') {
          return null;
        }

        let fileSize = 0;
        if (row.original.size !== undefined) {
          fileSize = row.original.size;
        }
        return (
          <div className={sizeColumnWidth}>
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
        if (row.original.filePath === '__parent__') {
          return null;
        }

        const { t } = useTranslation();

        const renderFileCategorize = (item: DirectoryFileDTO) => {
          if (row.original.type === ContentType.FILE) {
            return t(`fileCategory.${getFileCategorie(item.filePath)}`);
          }
          return t('fileCategory.folder');
        };

        return (
          <div className={`hidden lg:flex ${typeColumnWidth}`}>
            <span className="text-right text-base font-medium">{renderFileCategorize(row.original)}</span>
          </div>
        );
      },
    },
  ];

  if (visibleColumns) {
    return allColumns.filter((column) => visibleColumns?.includes(column.id as string));
  }

  return allColumns;
};

export default getFileSharingTableColumns;
