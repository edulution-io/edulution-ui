import React, { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import Checkbox from '@/components/ui/Checkbox';
import { Button } from '@/components/ui/Button';
import {
  MdDriveFileRenameOutline,
  MdOutlineDeleteOutline,
  MdOutlineDriveFileMove,
  MdOutlineFileDownload,
  MdFolder,
} from 'react-icons/md';

import useFileManagerStore from '@/store/fileManagerStore';
import ActionTooltip from '@/pages/FileSharing/utilities/ActionTooltip';
import { TooltipProvider } from '@/components/ui/Tooltip';
import WebDavFunctions from '@/webdavclient/WebDavFileManager';
import LoadingIndicator from '@/components/shared/LoadingIndicator';
import { formatBytes } from '@/pages/FileSharing/utilities/common';
import RenameItemDialog from '@/pages/FileSharing/dialog/RenameItemDialog';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import DeleteItemAlert from '@/pages/FileSharing/alerts/DeleteItemAlert';
import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import FilePreviewDialog from '@/pages/FileSharing/dialog/FilePreviewDialog';
import FileIconComponent from '@/pages/FileSharing/mimetypes/FileIconComponent';
import { Icon } from '@radix-ui/react-select';
import getFileCategorie from '@/pages/FileSharing/utilities/fileManagerUtilits';

const selectFileNameWidth = 'w-4/12';
const lastModColumnWidth = 'w-5/12';
const sizeColumnWidth = 'w-1/12';
const typeColumnWidth = 'w-1/12';
const operationsColumnWidth = 'w-1/12';

const parseDate = (value: unknown): Date | null => {
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
};

const Columns: ColumnDef<DirectoryFile>[] = [
  {
    id: 'select-filename',
    // In your columns definition

    header: ({ table, column }) => (
      <div className={`flex items-center ${selectFileNameWidth}`}>
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(value)}
          aria-label="Select all"
        />
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <div className="flex items-center justify-between">
            File Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </div>
        </Button>
      </div>
    ),
    accessorFn: (row) => row.type + row.filename,

    cell: ({ row }) => {
      const [isPreviewOpen, setPreviewOpen] = useState(false);
      const { filename } = row.original;
      const formattedFilename = filename.split('/').pop();
      const fetchFiles = useFileManagerStore((state) => state.fetchFiles);
      const handleFilenameClick = (filenamePath: string) => {
        if (row.original.type === ContentType.file) {
          setPreviewOpen(true);
        }
        if (row.original.type === ContentType.directory) {
          fetchFiles(filenamePath).catch(() => {});
        }
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
        <div className={`${selectFileNameWidth} flex items-center `}>
          <div className="flex items-center">
            <Checkbox
              checked={row.getIsSelected()}
              onCheckedChange={handleCheckboxChange}
              aria-label="Select row"
            />
            <Icon
              className="ml-2 mr-2"
              style={{ fontSize: '16px', width: '16px', height: '16px' }}
            >
              {renderFileIcon(row.original)}
            </Icon>

            <span
              className="cursor-pointer text-left font-medium"
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
              {formattedFilename}
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
    header: ({ column }) => (
      <div className={lastModColumnWidth}>
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <div className="">Last Modified</div>
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const directoryFile = row.original;
      let formattedDate: string;

      if (directoryFile.lastmod) {
        const date = new Date(directoryFile.lastmod);
        formattedDate = !Number.isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
      } else {
        formattedDate = 'Date not provided';
      }
      return (
        <div className={`flex items-center justify-center ${lastModColumnWidth}`}>
          <span className="text-center font-medium">{formattedDate}</span>
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
    header: ({ column }) => (
      <div className={sizeColumnWidth}>
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <div className="">Size</div>
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      let fileSize = 0;
      if (row.original.size !== undefined) {
        fileSize = row.original.size;
      }
      return (
        <div className={`flex flex-row  ${sizeColumnWidth}`}>
          <p className="text-right font-medium">{formatBytes(fileSize)}</p>
        </div>
      );
    },
  },

  {
    accessorKey: 'type',
    header: ({ column }) => (
      <div className={typeColumnWidth}>
        <Button onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
          <div className="">Type</div>
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const renderFileCategorize = (item: DirectoryFile) => {
        if (row.original.type === ContentType.file) {
          return getFileCategorie(item.filename);
        }
        return 'Folder';
      };

      return <div className={`flex flex-row  ${typeColumnWidth}`}>{renderFileCategorize(row.original)}</div>;
    },
  },

  {
    accessorKey: 'delete',
    header: () => (
      <div className={operationsColumnWidth}>
        <div className={`flex items-center justify-between ${operationsColumnWidth}`} />
      </div>
    ),
    cell: ({ row }) => {
      const selectedItems: DirectoryFile[] = useFileManagerStore((state) => state.selectedItems);
      const { setLoading, isLoading } = useFileManagerStore();
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
            <div>{isLoading && <LoadingIndicator isOpen={isLoading} />}</div>
            <div className="flex items-center justify-end">
              <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText="Add File"
                  trigger={
                    <RenameItemDialog
                      trigger={
                        <div>
                          <MdDriveFileRenameOutline />
                        </div>
                      }
                      item={row.original}
                    />
                  }
                />
              </div>
              <div className={`flex items-center justify-end ${operationsColumnWidth}`}>
                <ActionTooltip
                  onAction={() => {}}
                  tooltipText="Add File"
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
                  tooltipText="Add File"
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
                  tooltipText="Add File"
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
