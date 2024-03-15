import {
  AntiMalwareIcon,
  BackupIcon,
  Chat,
  Conferences,
  DesktopDeployment,
  FileSharing,
  Firewall,
  Forums,
  KnowledgeBase,
  LearningManagement,
  LocationServicesIcon,
  Mail,
  MobileDevicesIcon,
  Network,
  Printer,
  RoomBooking,
  SchoolInformation,
  SchoolManagementIcon,
  TicketSystemIcon,
  Virtualization,
  Wlan,
} from '@/assets/icons';
import { APPS } from '@/datatypes/types';

export const QUERY_KEY: Record<string, string> = {
  repoData: 'repoData',
};

type SettingsOptions = {
  id: string;
  icon: string;
  color: string;
};

export const SETTINGS_APPSELECT_OPTIONS: SettingsOptions[] = [
  {
    id: APPS.TICKETSYSTEM,
    icon: TicketSystemIcon,
    color: 'bg-ciDarkBlue',
  },
  { id: APPS.MAIL, icon: Mail, color: 'bg-ciDarkBlue' },
  { id: APPS.CHAT, icon: Chat, color: 'bg-ciDarkBlue' },
  {
    id: APPS.CONFERENCES,
    icon: Conferences,
    color: 'bg-ciDarkBlue',
  },
  {
    id: APPS.KNOWLEDGEBASE,
    icon: KnowledgeBase,
    color: 'bg-ciDarkBlue',
  },
  {
    id: APPS.FILESHARING,
    icon: FileSharing,
    color: 'bg-ciDarkBlue',
  },
  { id: APPS.FORUMS, icon: Forums, color: 'bg-ciDarkBlue' },
  {
    id: APPS.ROOMBOOKING,
    icon: RoomBooking,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.LEARNINGMANAGEMENT,
    icon: LearningManagement,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.SCHOOLINFORMATION,
    icon: SchoolInformation,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.SCHOOLMANAGEMENT,
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
  },
  { id: APPS.PRINTER, icon: Printer, color: 'bg-ciLightGreen' },
  { id: APPS.NETWORK, icon: Network, color: 'bg-ciLightGreen' },
  {
    id: APPS.LOCATIONSERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: APPS.DESKTOPDEPLOYMENT,
    icon: DesktopDeployment,
    color: 'bg-ciLightGreen',
  },
  { id: APPS.WLAN, icon: Wlan, color: 'bg-ciLightGreen' },
  {
    id: APPS.MOBILEDEVICES,
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: APPS.VIRTUALIZATION,
    icon: Virtualization,
    color: 'bg-ciLightGreen',
  },
  { id: APPS.FIREWALL, icon: Firewall, color: 'bg-ciGreenToBlue' },
  {
    id: APPS.ANTIMALWARE,
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
  },
  { id: APPS.BACKUP, icon: BackupIcon, color: 'bg-ciGreenToBlue' },
];
