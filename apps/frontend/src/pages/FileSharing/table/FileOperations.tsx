import { DirectoryFile } from '@/datatypes/filesystem';
import { SHContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/SHContextMenu';
import { MdOutlineFileDownload, MdOutlineMoreVert } from 'react-icons/md';
import React, { FC } from 'react';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import { translateKey } from '@/utils/common';
import DeleteItemAlert from '@/pages/FileSharing/alerts/DeleteItemAlert';
import RenameItemDialog from '@/pages/FileSharing/dialog/RenameItemDialog';

interface FileOperationsProps {
  file: DirectoryFile;
}

const FileOperations: FC<FileOperationsProps> = ({ file }) => (
  <SHContextMenu>
    <ContextMenuTrigger>
      <MdOutlineMoreVert />
    </ContextMenuTrigger>
    <ContextMenuContent>
      <ContextMenuItem asChild>
        <MoveItemDialog
          trigger={
            <div className="flex items-center">
              <p className="text-black">{translateKey('tooltip.move')}</p>
            </div>
          }
          item={file}
        />
      </ContextMenuItem>
      <ContextMenuItem asChild>
        <DeleteItemAlert
          trigger={
            <div className="flex items-center">
              <p className="text-black">{translateKey('tooltip.delete')}</p>
            </div>
          }
          file={[file]}
        />
      </ContextMenuItem>
      <ContextMenuItem asChild>
        <RenameItemDialog
          trigger={
            <div className="flex items-center">
              <p className="text-black">{translateKey('tooltip.rename')}</p>
            </div>
          }
          item={file}
        />
      </ContextMenuItem>
      <ContextMenuItem onClick={() => {}}>
        <div className="flex cursor-pointer items-center">
          <MdOutlineFileDownload className="mr-2" />
          {translateKey('tooltip.download')}
        </div>
      </ContextMenuItem>
    </ContextMenuContent>
  </SHContextMenu>
);

export default FileOperations;
