import React from 'react';
import { APPS } from '@libs/appconfig/types';
import FramePlaceholder from '@/components/framing/FramePlaceholder';
import { ConferencePage } from '@/pages/ConferencePage';
import DesktopDeploymentPage from '@/pages/DesktopDeployment/DesktopDeploymentPage';
import FileSharingPage from '@/pages/FileSharing/FileSharingPage';
import SurveysPage from '@/pages/Surveys/SurveysPage';
import { Outlet } from 'react-router-dom';

const pages: Partial<Record<APPS, JSX.Element>> = {
  [APPS.CONFERENCES]: <ConferencePage />,
  [APPS.FILE_SHARING]: <FileSharingPage />,
  [APPS.MAIL]: <FramePlaceholder />,
  [APPS.LINUXMUSTER]: <FramePlaceholder />,
  [APPS.WHITEBOARD]: <FramePlaceholder />,
  [APPS.SURVEYS]: <SurveysPage />,
  [APPS.DESKTOP_DEPLOYMENT]: <DesktopDeploymentPage />,
  [APPS.CLASS_MANAGEMENT]: <Outlet />,
};

type NativeAppPageProps = {
  page: APPS;
};

const NativeAppPage: React.FC<NativeAppPageProps> = ({ page }) => pages[page];

export default NativeAppPage;
