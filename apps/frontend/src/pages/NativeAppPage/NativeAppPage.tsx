import React from 'react';
import { Outlet } from 'react-router-dom';
import APPS from '@libs/appconfig/constants/apps';
import type TApps from '@libs/appconfig/types/appsType';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import { ConferencePage } from '@/pages/ConferencePage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';
import BulletinBoardEditorialPage from '@/pages/BulletinBoardEditorial/BulletinBoardEditorialPage';

const pages: Partial<Record<TApps, JSX.Element>> = {
  [APPS.CONFERENCES]: <ConferencePage />,
  [APPS.FILE_SHARING]: <FileSharingPage />,
  [APPS.MAIL]: <FramePlaceholder />,
  [APPS.LINUXMUSTER]: <FramePlaceholder />,
  [APPS.WHITEBOARD]: <FramePlaceholder />,
  [APPS.DESKTOP_DEPLOYMENT]: <DesktopDeploymentPage />,
  [APPS.CLASS_MANAGEMENT]: <Outlet />,
  [APPS.BULLETIN_BOARD]: <BulletinBoardEditorialPage />,
};

type NativeAppPageProps = {
  page: TApps;
};

const NativeAppPage: React.FC<NativeAppPageProps> = ({ page }) => pages[page];

export default NativeAppPage;
