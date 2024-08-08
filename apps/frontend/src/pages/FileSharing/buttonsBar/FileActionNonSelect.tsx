import React, { FC } from 'react';
import { t } from 'i18next';
import { MdFilePresent } from 'react-icons/md';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import FloatingButtonsBarConfig from '@libs/common/types/floatingButtonsBarConfig';
import FileActionButtonProps from '@libs/filesharing/types/fileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FileTypesConfiguration from '@libs/filesharing/types/fileTypesConfiguration';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import UploadButton from '@/components/shared/FloatingsButtonsBar/CommonButtonConfigs/uploadButton';
import FloatingButtonsBar from '@/components/shared/FloatingsButtonsBar/FloatingButtonsBar';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType } = useFileSharingDialogStore();
  const config: FloatingButtonsBarConfig = {
    buttons: [
      {
        variant: 'dropdown',
        icon: MdFilePresent,
        text: t('tooltip.create.file'),
        onClick: () => openDialog(FileActionType.CREATE_FILE),
        options: FileTypesConfiguration,
        onSelectFileSelect: setSelectedFileType,
      },
      {
        icon: HiOutlineFolderAdd,
        text: t('tooltip.create.folder'),
        onClick: () => openDialog(FileActionType.CREATE_FOLDER),
      },
      UploadButton(() => openDialog(FileActionType.UPLOAD_FILE)),
    ],
    keyPrefix: 'file-sharing-page-floating-button_',
  };

  return <FloatingButtonsBar config={config} />;
};

export default FileActionNonSelect;
