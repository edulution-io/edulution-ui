import FramePlaceholder from '@/components/framing/FramePlaceholder';
import { ConferencePage } from '@/pages/ConferencePage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';
import { APPS } from '@libs/appconfig/types';
import React from 'react';
import { Navigate } from 'react-router-dom';

const pages: Partial<Record<APPS, JSX.Element>> = {
  [APPS.CONFERENCES]: <ConferencePage />,
  [APPS.FILE_SHARING]: <FileSharingPage />,
  [APPS.MAIL]: <FramePlaceholder />,
  [APPS.LINUXMUSTER]: <FramePlaceholder />,
  [APPS.WHITEBOARD]: <FramePlaceholder />,
  [APPS.DESKTOP_DEPLOYMENT]: <DesktopDeploymentPage />,
};

const useGetNativePage = (page: APPS): JSX.Element =>
  pages[page] || (
    <Navigate
      replace
      to="/"
    />
  );

export default useGetNativePage;
