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

export const QUERY_KEY: Record<string, string> = {
  repoData: 'repoData',
};

interface SettingsOptions {
  id: string;
  icon: string;
  color: string;
}

export const SETTINGS_APPSELECT_OPTIONS: SettingsOptions[] = [
  {
    id: 'ticketsystem',
    icon: TicketSystemIcon,
    color: 'bg-ciDarkBlue',
  },
  { id: 'mail', icon: Mail, color: 'bg-ciDarkBlue' },
  { id: 'chat', icon: Chat, color: 'bg-ciDarkBlue' },
  {
    id: 'conferences',
    icon: Conferences,
    color: 'bg-ciDarkBlue',
  },
  {
    id: 'knowledgebase',
    icon: KnowledgeBase,
    color: 'bg-ciDarkBlue',
  },
  {
    id: 'filesharing',
    icon: FileSharing,
    color: 'bg-ciDarkBlue',
  },
  { id: 'forums', icon: Forums, color: 'bg-ciDarkBlue' },
  {
    id: 'roombooking',
    icon: RoomBooking,
    color: 'bg-ciLightBlue',
  },
  {
    id: 'learningmanagement',
    icon: LearningManagement,
    color: 'bg-ciLightBlue',
  },
  {
    id: 'schoolinformation',
    icon: SchoolInformation,
    color: 'bg-ciLightBlue',
  },
  {
    id: 'schoolmanagement',
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
  },
  { id: 'printer', icon: Printer, color: 'bg-ciLightGreen' },
  { id: 'network', icon: Network, color: 'bg-ciLightGreen' },
  {
    id: 'locationservices',
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: 'desktopdeployment',
    icon: DesktopDeployment,
    color: 'bg-ciLightGreen',
  },
  { id: 'wlan', icon: Wlan, color: 'bg-ciLightGreen' },
  {
    id: 'mobiledevices',
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: 'virtualization',
    icon: Virtualization,
    color: 'bg-ciLightGreen',
  },
  { id: 'firewall', icon: Firewall, color: 'bg-ciGreenToBlue' },
  {
    id: 'antimalware',
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
  },
  { id: 'backup', icon: BackupIcon, color: 'bg-ciGreenToBlue' },
];
