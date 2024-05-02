import { DirectoryFile } from '@/datatypes/filesystem';

export enum AppType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type ConfigType = {
  name: string;
  linkPath: string;
  icon: string;
  appType: AppType;
};

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
  icon: string;
  color: string;
}

export enum APPS {
  TICKET_SYSTEM = 'ticketsystem',
  MAIL = 'mail',
  CHAT = 'chat',
  CONFERENCES = 'conferences',
  KNOWLEDGE_BASE = 'knowledgebase',
  FILE_SHARING = 'filesharing',
  FORUMS = 'forums',
  ROOM_BOOKING = 'roombooking',
  LEARNING_MANAGEMENT = 'learningmanagement',
  SCHOOL_INFORMATION = 'schoolinformation',
  SCHOOL_MANAGEMENT = 'schoolmanagement',
  PRINTER = 'printer',
  NETWORK = 'network',
  LOCATION_SERVICES = 'locationservices',
  DESKTOP_DEPLOYMENT = 'desktopdeployment',
  WLAN = 'wlan',
  MOBILE_DEVICES = 'mobiledevices',
  VIRTUALIZATION = 'virtualization',
  FIREWALL = 'firewall',
  ANTIMALWARE = 'antimalware',
  BACKUP = 'backup',
}

export interface FileTypePreviewProps {
  file: DirectoryFile;
}
