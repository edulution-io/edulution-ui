import React, { FC } from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove } from 'react-icons/md';
import { t } from 'i18next';
import FileActionButtonProps from '@libs/filesharing/FileActionButtonProps';
import FileActionType from '@libs/filesharing/types/fileActionType';

const FileActionMultiSelect: FC<FileActionButtonProps> = ({ openDialog }) => (
  <>
    <FloatingActionButton
      icon={MdOutlineDeleteOutline}
      text={t('tooltip.delete')}
      onClick={() => openDialog(FileActionType.DELETE_FILE_FOLDER)}
    />
    <FloatingActionButton
      icon={MdOutlineDriveFileMove}
      text={t('tooltip.move')}
      onClick={() => openDialog(FileActionType.MOVE_FILE_FOLDER)}
    />
  </>
);

export default FileActionMultiSelect;
