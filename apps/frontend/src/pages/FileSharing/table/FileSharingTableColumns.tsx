import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { MdFolder } from 'react-icons/md';
import {
  formatBytes,
  getElapsedTime,
  getFileCategorie,
  parseDate,
} from '@/pages/FileSharing/utilities/fileManagerUtilities';
import { translateKey } from '@/utils/common';
import { useSearchParams } from 'react-router-dom';
import SortableHeader from '@/components/ui/Table/SortableHeader';
import SelectableTextCell from '@/components/ui/Table/SelectableTextCell';
import { ContentType, DirectoryFile } from '@libs/filesharing/filesystem';
import FileIconComponent from '@/pages/FileSharing/utilities/FileIconComponent';
import { TABLE_ICON_SIZE } from '@libs/ui/constants';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';

const sizeColumnWidth = 'w-1/12 lg:w-3/12 md:w-1/12';
const typeColumnWidth = 'w-1/12 lg:w-1/12 md:w-1/12';

const hideOnMobileClassName = 'hidden lg:flex';

const FileSharingTableColumns: ColumnDef<DirectoryFile>[] = [
  {
    id: 'select-filename',

    header: ({ table, column }) => (
      <SortableHeader<DirectoryFile, unknown>
        titleTranslationId="fileSharingTable.filename"
        table={table}
        column={column}
      />
    ),
    accessorFn: (row) => row.type + row.filename,

    cell: ({ row }) => {
      const [searchParams, setSearchParams] = useSearchParams();
      const { setCurrentlyEditingFile } = useFileSharingStore();
      const handleFilenameClick = (filenamePath: string) => {
        if (row.original.type === ContentType.directory) {
          searchParams.set('path', filenamePath);
          setSearchParams(searchParams);
          setCurrentlyEditingFile(null);
        } else {
          setCurrentlyEditingFile(null);
          setCurrentlyEditingFile(row.original);
        }
      };
      const renderFileIcon = (item: DirectoryFile) => {
        if (row.original.type === ContentType.file) {
          return (
            <FileIconComponent
              filename={item.filename}
              size={Number(TABLE_ICON_SIZE)}
            />
          );
        }
        return <MdFolder size={TABLE_ICON_SIZE} />;
      };

      return (
        <div className="w-full">
          <SelectableTextCell
            icon={renderFileIcon(row.original)}
            row={row}
            text={row.original.basename}
            onClick={() => handleFilenameClick(row.original.filename)}
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
    accessorKey: 'lastmod',
    header: function Header({ column }) {
      return (
        <SortableHeader<DirectoryFile, unknown>
          className={hideOnMobileClassName}
          titleTranslationId="fileSharingTable.lastModified"
          column={column}
        />
      );
    },
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
    accessorKey: 'size',
    header: function Header({ column }) {
      return (
        <SortableHeader<DirectoryFile, unknown>
          className={hideOnMobileClassName}
          titleTranslationId="fileSharingTable.size"
          column={column}
        />
      );
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
    accessorKey: 'type',
    header: function Header({ column }) {
      return (
        <SortableHeader<DirectoryFile, unknown>
          className={hideOnMobileClassName}
          titleTranslationId="fileSharingTable.type"
          column={column}
        />
      );
    },
    cell: function Cell({ row }) {
      const renderFileCategorize = (item: DirectoryFile) => {
        if (row.original.type === ContentType.file) {
          return translateKey(`fileCategory.${getFileCategorie(item.filename)}`);
        }
        return translateKey('fileCategory.folder');
      };

      return (
        <div className={`hidden lg:flex ${typeColumnWidth}`}>
          <span className="text-right text-base font-medium">{renderFileCategorize(row.original)}</span>
        </div>
      );
    },
  },
];

export default FileSharingTableColumns;