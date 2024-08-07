import React, { FC } from 'react';
import { t } from 'i18next';
import { MdDriveFileRenameOutline } from 'react-icons/md';
import ContentType from '@libs/filesharing/types/contentType';
import FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import MAX_FILE_UPLOAD_SIZE from '@libs/ui/constants/maxFileUploadSize';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import { bytesToMegabytes } from '@/pages/FileSharing/utilities/filesharingUtilities';
import FloatingButtonsBar from '@/components/shared/FloatingButtonsBar';
import DownloadButton from '@/components/shared/FloatingButtons/DownloadButton';
import MoveButton from '@/components/shared/FloatingButtons/MoveButton';
import DeleteButton from '@/components/shared/FloatingButtons/DeleteButton';

const FileActionOneSelect: FC<FileActionButtonProps> = ({ openDialog, selectedItem }) => {
  const { downloadFile } = useFileSharingStore();

  const startDownload = async (filePath: string, filename: string) => {
    const downloadLinkURL = await downloadFile(filePath);
    if (!downloadLinkURL) return;
    const link = document.createElement('a');
    link.href = downloadLinkURL;
    link.setAttribute('download', filename);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    window.URL.revokeObjectURL(downloadLinkURL);
  };

  const config: FloatingButtonsBarConfig = {
    buttons: [
      DeleteButton(() => openDialog(FileActionType.DELETE_FILE_FOLDER)),
      MoveButton(() => openDialog(FileActionType.MOVE_FILE_FOLDER)),
      {
        icon: MdDriveFileRenameOutline,
        text: t('tooltip.rename'),
        onClick: () => openDialog(FileActionType.RENAME_FILE_FOLDER),
      },
      DownloadButton(
        selectedItem ? () => startDownload(selectedItem.filename, selectedItem.basename) : () => {},
        selectedItem?.type === ContentType.FILE && bytesToMegabytes(selectedItem?.size || 0) < MAX_FILE_UPLOAD_SIZE,
      ),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};
export default FileActionOneSelect;
