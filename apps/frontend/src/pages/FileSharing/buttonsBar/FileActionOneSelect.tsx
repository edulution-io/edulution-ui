import FileAction from '@libs/filesharing/FileAction';
import React, { FC } from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdDownload, MdDriveFileRenameOutline } from 'react-icons/md';
import { t } from 'i18next';
import useFileSharingStore from '@/pages/FileSharing/FileSharingStore';
import ContentType from '@libs/filesharing/ContentType';
import FileActionButtonProps from '@libs/filesharing/FileActionButtonProps';

const FileActionOneSelect: FC<FileActionButtonProps> = ({ openDialog, selectedItem }) => {
  const { downloadFile } = useFileSharingStore();

  const startDownload = async (filePath: string, filename: string) => {
    try {
      const downloadLinkURL = await downloadFile(filePath);
      if (!downloadLinkURL) throw new Error('No download link URL');
      const link = document.createElement('a');
      link.href = downloadLinkURL;
      link.setAttribute('download', filename);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(downloadLinkURL);
    } catch (error) {
      console.error('Error getting the download link URL', error);
    }
  };

  return (
    <>
      <FloatingActionButton
        icon={MdDriveFileRenameOutline}
        text={t('tooltip.rename')}
        onClick={() => openDialog(FileAction.RENAME)}
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
