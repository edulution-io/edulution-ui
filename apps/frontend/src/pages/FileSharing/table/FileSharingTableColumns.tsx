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
import useFileEditorStore from '@/pages/FileSharing/previews/onlyOffice/useFileEditorStore';
import getPathWithoutWebdav from '@libs/filesharing/utils/getPathWithoutWebdav';
import FILESHARING_TABLE_COLUM_NAMES from '@libs/filesharing/constants/filesharingTableColumNames';
import { useTranslation } from 'react-i18next';

const sizeColumnWidth = 'w-1/12 lg:w-3/12 md:w-1/12';
const typeColumnWidth = 'w-1/12 lg:w-1/12 md:w-1/12';

const hideOnMobileClassName = 'hidden lg:flex';

const FileSharingTableColumns = (
  onFilenameClick?: (row: DirectoryFileDTO) => void,
  visibleColumns?: string[],
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
        const { setCurrentlyEditingFile, currentlyEditingFile } = useFileSharingStore();
        const { setShowEditor } = useFileEditorStore();

        const defaultHandleFilenameClick = (filenamePath: string) => {
          setShowEditor(false);
          if (row.original.type === ContentType.DIRECTORY) {
            searchParams.set('path', filenamePath);
            setSearchParams(searchParams);
            setShowEditor(false);
            setCurrentlyEditingFile(null);
          } else if (currentlyEditingFile?.filename !== row.original.filename) {
            setCurrentlyEditingFile(row.original);
          } else {
            setShowEditor(true);
          }
        };

        const handleCellClick = (filenamePath: string) => {
          if (onFilenameClick) {
            onFilenameClick(row.original);
          } else {
            defaultHandleFilenameClick(filenamePath);
          }
        };

        const renderFileIcon = (item: DirectoryFileDTO) =>
          item.type === ContentType.FILE ? (
            <FileIconComponent
              filename={item.filename}
              size={Number(TABLE_ICON_SIZE)}
            />
          ) : (
            <MdFolder size={TABLE_ICON_SIZE} />
          );

        return (
          <div className="w-full">
            <SelectableTextCell
              icon={renderFileIcon(row.original)}
              row={row}
              text={row.original.basename}
              onClick={() => handleCellClick(getPathWithoutWebdav(row.original.filename))}
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
      header: function Header({ column }) {
        return <SortableHeader<DirectoryFileDTO, unknown> column={column} />;
      },
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
      header: function Header({ column }) {
        return (
          <SortableHeader<DirectoryFileDTO, unknown>
            className={hideOnMobileClassName}
            column={column}
          />
        );
      },
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
      header: function Header({ column }) {
        return (
          <SortableHeader<DirectoryFileDTO, unknown>
            className={hideOnMobileClassName}
            column={column}
          />
        );
      },
      meta: {
        translationId: 'fileSharingTable.type',
      },
      cell: function Cell({ row }) {
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
    return allColumns.filter((column) => visibleColumns.includes(column.id as string));
  }

  return allColumns;
};

export default FileSharingTableColumns;
