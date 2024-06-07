import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Checkbox from '@/components/ui/Checkbox';
import { ButtonSH } from '@/components/ui/ButtonSH';
import {
  MdDriveFileRenameOutline,
  MdFolder,
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
} from 'react-icons/md';

import useFileManagerStoreOLD from '@/store/fileManagerStoreOLD';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import { TooltipProvider } from '@/components/ui/Tooltip';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { formatBytes } from '@/pages/FileSharing/utilities/fileManagerCommon';
import RenameItemDialog from '@/pages/FileSharing/dialog/RenameItemDialog';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import DeleteItemAlert from '@/pages/FileSharing/alerts/DeleteItemAlert';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import FilePreviewDialog from '@/pages/FileSharing/dialog/FilePreviewDialog';
import FileIconComponent from '@/pages/FileSharing/mimetypes/FileIconComponent';
import { Icon } from '@radix-ui/react-select';
import { getElapsedTime, getFileCategorie, parseDate } from '@/pages/FileSharing/utilities/fileManagerUtilits';
import { translateKey } from '@/utils/common';

const lastModColumnWidth = 'w-3/12 lg:w-3/12 md:w-3/12';
const sizeColumnWidth = 'w-1/12 lg:w-3/12 md:w-1/12';
const typeColumnWidth = 'w-1/12 lg:w-1/12 md:w-1/12';
const selectFileNameWidth = 'w-3/5 lg:w-1/4 xl:w-1/4';
const operationsColumnWidth = 'w-2/5 lg:w-3/4 xl:w-3/4';

const Columns: ColumnDef<DirectoryFile>[] = [
  {
    id: 'select-filename',

    header: function Header({ table, column }) {
      return (
        <div className={`flex items-center ${selectFileNameWidth}`}>
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
            onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
            aria-label="Select all"
          />
          <ButtonSH onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <div className="flex items-center">
              {translateKey('fileSharingTable.filename')}
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
          </ButtonSH>
        </div>
      );
    },
    accessorFn: (row) => row.type + row.filename,

    cell: ({ row }) => {
      const [isPreviewOpen, setPreviewOpen] = useState(false);
      const { filename } = row.original;
      const formattedFilename = filename.split('/').pop();
      const fetchFiles = useFileManagerStoreOLD((state) => state.fetchFiles);

      const handleFilenameClick = (filenamePath: string) => {
        if (row.original.type === ContentType.file) {
          setPreviewOpen(true);
        }
        if (row.original.type === ContentType.directory) {
          fetchFiles(filenamePath).catch(() => {});
        }
      };

      const truncate = (str: string | undefined, num: number) => {
        if (!str) return str;
        if (str.length <= num) return str;
        return `${str.slice(0, num)}...`;
      };

      const handleCheckboxChange = () => {
        row.toggleSelected(!row.getIsSelected());
      };

      const renderFileIcon = (item: DirectoryFile) => {
        if (row.original.type === ContentType.file) {
          return <FileIconComponent filename={item.filename} />;
        }
        return <MdFolder />;
      };

      return (
        <div className={`${selectFileNameWidth} flex items-center justify-between space-x-2 sm:justify-start `}>
          <div className="flex items-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={handleCheckboxChange}
              aria-label="Select row"
            />
            <Icon
              className="mb-3 ml-2 mr-2 mt-3"
              style={{ fontSize: '32px', width: '32px', height: '32px' }}
            >
              {renderFileIcon(row.original)}
            </Icon>

            <span
              className="cursor-pointer truncate text-left font-medium"
              onClick={() => handleFilenameClick(row.original.filename)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Space') {
                  handleFilenameClick(row.original.filename);
                }
              }}
              role="button"
              tabIndex={0}
              style={{ userSelect: 'none' }}
            >
              <span className="text-md truncate font-medium">{truncate(formattedFilename, 10)}</span>
            </span>
            {isPreviewOpen && (
              <FilePreviewDialog
                file={row.original}
                isOpen={isPreviewOpen}
                onClose={() => setPreviewOpen(false)}
              />
            )}
          </div>
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
        <div className={`${lastModColumnWidth} hidden lg:flex `}>
          <ButtonSH onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <div className=""> {translateKey('fileSharingTable.lastModified')}</div>
          </ButtonSH>
        </div>
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
      return (
        <div className={`hidden items-center justify-center lg:flex ${lastModColumnWidth}`}>
          <span className="text-md text-center font-medium">{formattedDate}</span>
        </div>
      );
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
        <div className={`${sizeColumnWidth} hidden lg:flex`}>
          <ButtonSH onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <div className=""> {translateKey('fileSharingTable.size')}</div>
          </ButtonSH>
        </div>
      );
    },
    cell: ({ row }) => {
      let fileSize = 0;
      if (row.original.size !== undefined) {
        fileSize = row.original.size;
      }
      return (
        <div className={`hidden flex-row lg:flex ${sizeColumnWidth}`}>
          <p className="text-right font-medium">{formatBytes(fileSize)}</p>
        </div>
      );
    },
  },

  {
    accessorKey: 'type',
    header: function Header({ column }) {
      return (
        <div className={`${sizeColumnWidth} hidden lg:flex`}>
          <ButtonSH onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
            <div className=""> {translateKey('fileSharingTable.type')}</div>
          </ButtonSH>
        </div>
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
        <div className={` hidden flex-row text-right text-base font-medium lg:flex ${typeColumnWidth}`}>
          {renderFileCategorize(row.original)}
        </div>
      );
    },
  },

  {
    accessorKey: 'delete',
    header: () => <div className="hidden w-full justify-end md:flex" />,
    cell: ({ row }) => {
      const selectedItems: DirectoryFile[] = useFileManagerStoreOLD((state) => state.selectedItems);
      const { setLoading, isLoading } = useFileManagerStoreOLD();
      const handleDownload = async (item: DirectoryFile) => {
        setLoading(true);
        try {
          await WebDavFunctions.triggerFolderDownload(item.filename);
        } catch (error) {
          console.error('Download failed:', error);
        } finally {
          setLoading(false);
        }
      };
      return (
        selectedItems.length === 0 && (
          <TooltipProvider>
            {isLoading && <LoadingIndicator isOpen={isLoading} />}
            <div className="flex items-center justify-end">
              <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={translateKey('tooltip.rename')}
                  trigger={
                    <span>
                      <RenameItemDialog
                        trigger={
                          <span>
                            <MdDriveFileRenameOutline />
                          </span>
                        }
                        item={row.original}
                      />
                    </span>
                  }
                />
              </div>
              <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={translateKey('tooltip.move')}
                  trigger={
                    <MoveItemDialog
                      trigger={
                        <div>
                          <MdOutlineDriveFileMove />
                        </div>
                      }
                      item={row.original}
                    />
                  }
                />
              </div>
              <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                <ActionTooltip
                  onAction={() => {
                    if (row.original.type === ContentType.file) {
                      WebDavFunctions.triggerFileDownload(row.original.filename);
                    } else {
                      handleDownload(row.original).catch(() => {});
                    }
                  }}
                  tooltipText={translateKey('tooltip.download')}
                  trigger={
                    <div>
                      <MdOutlineFileDownload />
                    </div>
                  }
                />
              </div>
              <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText={translateKey('tooltip.delete')}
                  trigger={
                    <DeleteItemAlert
                      trigger={
                        <div>
                          <MdOutlineDeleteOutline />
                        </div>
                      }
                      file={[row.original]}
                    />
                  }
                />
              </div>
            </div>
          </TooltipProvider>
        )
      );
    },
  },
];

export default Columns;
