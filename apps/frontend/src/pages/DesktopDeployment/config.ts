import { DesktopDeploymentIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const DESKTOP_DEPLOYMENT_MENUBAR_CONFIG: MenuBarEntryProps = {
  title: 'desktopdeployment.title',
  icon: DesktopDeploymentIcon,
  disabled: true,
  color: 'hover:bg-ciLightBlue',
  menuItems: [
    {
      id: 'desktop',
      label: 'desktopdeployment.sidebar',
      icon: DesktopDeploymentIcon,
      action: () => {},
    },
  ],
};

export default DESKTOP_DEPLOYMENT_MENUBAR_CONFIG;
