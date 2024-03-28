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
    id: APPS.TICKET_SYSTEM,
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
    id: APPS.KNOWLEDGE_BASE,
    icon: KnowledgeBase,
    color: 'bg-ciDarkBlue',
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharing,
    color: 'bg-ciDarkBlue',
  },
  { id: APPS.FORUMS, icon: Forums, color: 'bg-ciDarkBlue' },
  {
    id: APPS.ROOM_BOOKING,
    icon: RoomBooking,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.LEARNING_MANAGEMENT,
    icon: LearningManagement,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.SCHOOL_INFORMATION,
    icon: SchoolInformation,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.SCHOOL_MANAGEMENT,
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
  },
  { id: APPS.PRINTER, icon: Printer, color: 'bg-ciLightGreen' },
  { id: APPS.NETWORK, icon: Network, color: 'bg-ciLightGreen' },
  {
    id: APPS.LOCATION_SERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeployment,
    color: 'bg-ciLightGreen',
  },
  { id: APPS.WLAN, icon: Wlan, color: 'bg-ciLightGreen' },
  {
    id: APPS.MOBILE_DEVICES,
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
