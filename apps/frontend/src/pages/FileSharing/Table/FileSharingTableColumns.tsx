/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MdFolder } from 'react-icons/md';
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
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import ContentType from '@libs/filesharing/types/contentType';
import useFileSharingStore from '@/pages/FileSharing/useFileSharingStore';
import useFileEditorStore from '@/pages/FileSharing/FilePreview/OnlyOffice/useFileEditorStore';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import { useTranslation } from 'react-i18next';
import CircleLoader from '@/components/ui/Loading/CircleLoader';

const sizeColumnWidth = 'w-1/12 lg:w-3/12 md:w-1/12';
const typeColumnWidth = 'w-1/12 lg:w-1/12 md:w-1/12';

const hideOnMobileClassName = 'hidden lg:flex';

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
        filename={item.filename}
        size={Number(TABLE_ICON_SIZE)}
      />
    );
  }
  return <MdFolder size={TABLE_ICON_SIZE} />;
};

const getFileSharingTableColumns = (
  visibleColumns?: string[],
  onFilenameClick?: (item: DirectoryFileDTO) => void,
): ColumnDef<DirectoryFileDTO>[] => {
  const allColumns: ColumnDef<DirectoryFileDTO>[] = [
    {
      id: FILESHARING_TABLE_COLUM_NAMES.SELECT_FILENAME,

      header: ({ table, column }) => (
        <SortableHeader<DirectoryFileDTO, unknown>
          table={table}
          column={column}
        />
      ),
      meta: {
        translationId: 'fileSharingTable.filename',
      },
      accessorFn: (row) => row.type + row.filename,
      cell: ({ row }) => {
        const [searchParams, setSearchParams] = useSearchParams();
        const { currentlyDisabledFiles, setFileIsCurrentlyDisabled } = useFileSharingStore();
        const { resetCurrentlyEditingFile, setPublicDownloadLink, setIsFilePreviewVisible, isFilePreviewDocked } =
          useFileEditorStore();
        const isCurrentlyDisabled = currentlyDisabledFiles[row.original.basename];
        const handleFilenameClick = () => {
          if (onFilenameClick) {
            onFilenameClick(row.original);
            return;
          }

          if (isCurrentlyDisabled) {
            return;
          }

          setPublicDownloadLink('');
          if (row.original.type === ContentType.DIRECTORY) {
            if (isFilePreviewDocked) setIsFilePreviewVisible(false);
            searchParams.set('path', getPathWithoutWebdav(row.original.filename));
            setSearchParams(searchParams);
          } else {
            void setFileIsCurrentlyDisabled(row.original.basename, true);
            setIsFilePreviewVisible(true);
            void resetCurrentlyEditingFile(row.original);
          }
        };

        const isSaving = currentlyDisabledFiles[row.original.basename];

        return (
          <div className={`w-full ${isSaving ? 'pointer-events-none opacity-50' : ''}`}>
            <SelectableTextCell
              icon={renderFileIcon(row.original, isCurrentlyDisabled)}
              row={row}
              text={row.original.basename}
              onClick={handleFilenameClick}
            />
          </div>
        );
      },
      enableHiding: false,

      sortingFn: (rowA, rowB) => {
        const valueA = rowA.original.type + rowA.original.filename;
        const valueB = rowB.original.type + rowB.original.filename;
        return valueA.localeCompare(valueB);
      },
    },
    {
      accessorKey: FILESHARING_TABLE_COLUM_NAMES.LAST_MODIFIED,
      id: FILESHARING_TABLE_COLUM_NAMES.LAST_MODIFIED,
      header: ({ column }) => <SortableHeader<DirectoryFileDTO, unknown> column={column} />,
      meta: {
        translationId: 'fileSharingTable.lastModified',
      },
      accessorFn: (row) => row.lastmod,
      cell: ({ row }) => {
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
      sortingFn: (rowA, rowB, columnId) => {
        const dateA = parseDate(rowA.original[columnId]);
        const dateB = parseDate(rowB.original[columnId]);

        if (!dateA || !dateB) {
          return !dateA ? -1 : 1;
        }

        return dateA.getTime() - dateB.getTime();
      },
    },
    {
      accessorKey: FILESHARING_TABLE_COLUM_NAMES.SIZE,
      id: FILESHARING_TABLE_COLUM_NAMES.SIZE,
      header: ({ column }) => (
        <SortableHeader<DirectoryFileDTO, unknown>
          className={hideOnMobileClassName}
          column={column}
        />
      ),
      meta: {
        translationId: 'fileSharingTable.size',
      },
      cell: ({ row }) => {
        let fileSize = 0;
        if (row.original.size !== undefined) {
          fileSize = row.original.size;
        }
        return (
          <div className={`hidden lg:flex ${sizeColumnWidth}`}>
            <span className="text-right text-base text-span font-medium">{formatBytes(fileSize)}</span>
          </div>
        );
      },
    },
    {
      accessorKey: FILESHARING_TABLE_COLUM_NAMES.TYPE,
      id: FILESHARING_TABLE_COLUM_NAMES.TYPE,
      header: ({ column }) => (
        <SortableHeader<DirectoryFileDTO, unknown>
          className={hideOnMobileClassName}
          column={column}
        />
      ),

      meta: {
        translationId: 'fileSharingTable.type',
      },

      cell: ({ row }) => {
        const { t } = useTranslation();

        const renderFileCategorize = (item: DirectoryFileDTO) => {
          if (row.original.type === ContentType.FILE) {
            return t(`fileCategory.${getFileCategorie(item.filename)}`);
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
