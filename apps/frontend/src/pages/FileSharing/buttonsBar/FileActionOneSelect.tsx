import React, { FC } from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdDownload, MdDriveFileRenameOutline } from 'react-icons/md';
import { t } from 'i18next';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import ContentType from '@libs/filesharing/ContentType';
import FileActionButtonProps from '@libs/filesharing/FileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';

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

  return (
    <>
      <FloatingActionButton
        icon={MdDriveFileRenameOutline}
        text={t('tooltip.rename')}
        onClick={() => openDialog(FileActionType.RENAME)}
      />
      {selectedItem?.type === ContentType.FILE && (
        <FloatingActionButton
          icon={MdDownload}
          text={t('tooltip.download')}
          onClick={() => startDownload(selectedItem.filename, selectedItem.basename)}
        />
      )}
    </>
  );
};
export default FileActionOneSelect;
