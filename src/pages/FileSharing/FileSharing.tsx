import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { FileSharing as FileSharingIcon, Desktop, Share, Students } from '@/assets/icons';
import MenuBar from '@/components/shared/MenuBar';
import MenuItem from '@/datatypes/types';

const FileSharing = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const demoMenuItems: MenuItem[] = [
    {
      label: t('home'),
      action: () => navigate('/file-sharing'),
      icon: FileSharingIcon,
    },
    {
      label: t('programs'),
      action: () => () => navigate('/file-sharing/profile'),
      icon: Desktop,
    },
    {
      label: t('share'),
      action: () => () => navigate('/file-sharing/settings'),
      icon: Share,
    },
    {
      label: t('students'),
      action: () => () => navigate('/'),
      icon: Students,
    },
  ];

  return (
    <MenuBar
      menuItems={demoMenuItems}
      title={t('fileSharing')}
      icon={FileSharingIcon}
      color="bg-ciDarkBlue"
    />
  );
};

export default FileSharing;
