import TApps from '@libs/appconfig/types/appsType';
import MenuItem from '@libs/menubar/menuItem';

interface MenuBarEntryProps {
  menuItems: MenuItem[];
  title: string;
  disabled?: boolean;
  icon: string;
  color: string;
  appName: TApps;
}

export default MenuBarEntryProps;
