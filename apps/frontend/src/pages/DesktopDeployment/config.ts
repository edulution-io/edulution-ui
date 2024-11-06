import { DesktopDeploymentIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const DESKTOP_DEPLOYMENT_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'desktopdeployment.title',
  icon: DesktopDeploymentIcon,
  disabled: true,
  appName: 'desktopdeployment',
  color: 'hover:bg-ciLightBlue',
  menuItems: [],
};

export default DESKTOP_DEPLOYMENT_MENUBAR_CONFIG;
