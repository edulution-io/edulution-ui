import { DirectoryFile } from '@/datatypes/filesystem';
import { AppConfigOptions } from '@/datatypes/appConfigOptions';

export enum AppIntegrationType {
  NATIVE = 'native',
  FORWARDED = 'forwarded',
  EMBEDDED = 'embedded',
}

export type AppConfig = {
  name: string;
  icon: string;
  appType: AppIntegrationType;
  options: AppConfigOptions;
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
  disabled?: boolean;
  icon: string;
  color: string;
}

export enum APPS {
  TICKET_SYSTEM = 'ticketsystem',
  MAIL = 'mail',
  CHAT = 'chat',
  CONFERENCES = 'conferences',
  SURVEYS = 'surveys',
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
  AICHAT = 'aichat',
  LINUXMUSTER = 'linuxmuster',
}

export interface FileTypePreviewProps {
  file: DirectoryFile;
}
