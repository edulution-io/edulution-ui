import { DesktopDeploymentIcon } from '@/assets/icons';
import MenuBarEntryProps from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const DESKTOP_DEPLOYMENT_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'desktopdeployment.title',
  icon: DesktopDeploymentIcon,
  disabled: true,
  appName: APPS.DESKTOP_DEPLOYMENT,
  color: 'hover:bg-ciLightBlue',
  menuItems: [],
};

export default DESKTOP_DEPLOYMENT_MENUBAR_CONFIG;
