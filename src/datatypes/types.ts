export enum AppType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type ConfigType = {
  [key: string]: { linkPath: string; icon: string; appType: AppType };
};

export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
}

export interface MenuBarEntryProps {
  menuItems: MenuItem[];
  title: string;
  icon: string;
  color: string;
}

export enum APPS {
  TICKETSYSTEM = 'ticketsystem',
  MAIL = 'mail',
  CHAT = 'chat',
  CONFERENCES = 'conferences',
  KNOWLEDGEBASE = 'knowledgebase',
  FILESHARING = 'filesharing',
  FORUMS = 'forums',
  ROOMBOOKING = 'roombooking',
  LEARNINGMANAGEMENT = 'learningmanagement',
  SCHOOLINFORMATION = 'schoolinformation',
  SCHOOLMANAGEMENT = 'schoolmanagement',
  PRINTER = 'printer',
  NETWORK = 'network',
  LOCATIONSERVICES = 'locationservices',
  DESKTOPDEPLOYMENT = 'desktopdeployment',
  WLAN = 'wlan',
  MOBILEDEVICES = 'mobiledevices',
  VIRTUALIZATION = 'virtualization',
  FIREWALL = 'firewall',
  ANTIMALWARE = 'antimalware',
  BACKUP = 'backup',
}
