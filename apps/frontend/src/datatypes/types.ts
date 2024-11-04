export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  path?: string;
}

export interface MenuBarEntryProps {
  menuItems: MenuItem[];
  title: string;
  disabled?: boolean;
  icon: string;
  color: string;
  appName: string;
}
