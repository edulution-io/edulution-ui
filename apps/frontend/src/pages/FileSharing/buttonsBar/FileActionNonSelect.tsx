import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdFilePresent } from 'react-icons/md';
import { HiOutlineFolderAdd } from 'react-icons/hi';
import { FiUpload } from 'react-icons/fi';
import React, { FC } from 'react';
import { t } from 'i18next';
import FileActionButtonProps from '@libs/filesharing/FileActionButtonProps';
import useFileSharingDialogStore from '@/pages/FileSharing/dialog/FileSharingDialogStore';
import FileActionType from '@libs/filesharing/types/fileActionType';
import FileTypesConfiguration from '@libs/filesharing/fileTypesConfiguration';

const FileActionNonSelect: FC<FileActionButtonProps> = ({ openDialog }) => {
  const { setSelectedFileType } = useFileSharingDialogStore();
  return (
    <>
      <FloatingActionButton
        variant="dropdown"
        icon={MdFilePresent}
        text={t('tooltip.create.file')}
        onClick={() => openDialog(FileActionType.CREATE_FILE)}
        options={FileTypesConfiguration}
        onSelectFileSelect={setSelectedFileType}
      />
      <FloatingActionButton
        icon={HiOutlineFolderAdd}
        text={t('tooltip.create.folder')}
        onClick={() => openDialog(FileActionType.CREATE_FOLDER)}
      />
      <FloatingActionButton
        icon={FiUpload}
        text={t('tooltip.upload')}
        onClick={() => openDialog(FileActionType.UPLOAD_FILE)}
      />
    </>
  );
};

export default FileActionNonSelect;
