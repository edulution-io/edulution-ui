import FileAction from '@libs/filesharing/FileAction';
import React, { FC } from 'react';
import FloatingActionButton from '@/components/ui/FloatingActionButton';
import { MdOutlineDeleteOutline, MdOutlineDriveFileMove } from 'react-icons/md';
import { t } from 'i18next';
import FileActionButtonProps from '@libs/filesharing/FileActionButtonProps';

const FileActionMultiSelect: FC<FileActionButtonProps> = ({ openDialog }) => (
  <>
    <FloatingActionButton
      icon={MdOutlineDeleteOutline}
      text={t('tooltip.delete')}
      onClick={() => openDialog(FileAction.DELETE)}
    />
    <FloatingActionButton
      icon={MdOutlineDriveFileMove}
      text={t('tooltip.move')}
      onClick={() => openDialog(FileAction.MOVE)}
    />
  </>
);

export default FileActionMultiSelect;
