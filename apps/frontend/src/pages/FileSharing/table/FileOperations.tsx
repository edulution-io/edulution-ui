import { ContentType, DirectoryFile } from '@/datatypes/filesystem';
import { ContextMenuContent, ContextMenuItem, ContextMenuTrigger, SHContextMenu } from '@/components/ui/SHContextMenu';
import { MdOutlineFileDownload, MdOutlineMoreVert } from 'react-icons/md';
import React, { FC } from 'react';
import MoveItemDialog from '@/pages/FileSharing/dialog/MoveItemDialog';
import { translateKey } from '@/utils/common';
import DeleteItemAlert from '@/pages/FileSharing/dialog/DeleteItemAlert';
import RenameItemDialog from '@/pages/FileSharing/dialog/RenameItemDialog';
import { triggerFileDownload } from '@/pages/FileSharing/utilities/fileManagerUtilits.ts';

import { convertDownloadLinkToBlob } from '@/pages/FileSharing/previews/utilitys/utilitys.ts';
import useFileManagerStore from '@/pages/FileSharing/fileManagerStore.ts';

interface FileOperationsProps {
  file: DirectoryFile;
}

const FileOperations: FC<FileOperationsProps> = ({ file }) => {
  const { downloadFile } = useFileManagerStore();
  return (
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
        {file.type === ContentType.file && (
          <ContextMenuItem onClick={() => {}}>
            <div
              className="flex cursor-pointer items-center"
              role={'button'}
              onClick={async () => {
                const downloadUrl = (await convertDownloadLinkToBlob((await downloadFile(file.filename)) || '')) || '';
                triggerFileDownload(downloadUrl);
              }}
            >
              <MdOutlineFileDownload className="mr-2" />

              {translateKey('tooltip.download')}
            </div>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </SHContextMenu>
  );
};

export default FileOperations;
