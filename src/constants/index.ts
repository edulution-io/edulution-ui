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

interface Options {
  id: string;
  name: string;
  link: string;
  icon: string;
  color: string;
}

export const SETTINGS_APPSELECT_OPTIONS: Options[] = [
  {
    id: '1',
    name: 'ticketsystem.sidebar',
    link: '/settings/ticketsystem',
    icon: TicketSystemIcon,
    color: 'bg-ciDarkBlue',
  },
  { id: '2', name: 'mail.sidebar', link: '/settings/mail', icon: Mail, color: 'bg-ciDarkBlue' },
  { id: '3', name: 'chat.sidebar', link: '/settings/chat', icon: Chat, color: 'bg-ciDarkBlue' },
  { id: '4', name: 'conferences.sidebar', link: '/settings/conferences', icon: Conferences, color: 'bg-ciDarkBlue' },
  {
    id: '5',
    name: 'knowledgebase.sidebar',
    link: '/settings/knowledgebase',
    icon: KnowledgeBase,
    color: 'bg-ciDarkBlue',
  },
  { id: '6', name: 'filesharing.sidebar', link: '/settings/filesharing', icon: FileSharing, color: 'bg-ciDarkBlue' },
  { id: '7', name: 'forums.sidebar', link: '/settings/forums', icon: Forums, color: 'bg-ciDarkBlue' },
  { id: '8', name: 'roombooking.sidebar', link: '/settings/roombooking', icon: RoomBooking, color: 'bg-ciLightBlue' },
  {
    id: '9',
    name: 'learningmanagement.sidebar',
    link: '/settings/learningmanagement',
    icon: LearningManagement,
    color: 'bg-ciLightBlue',
  },
  {
    id: '10',
    name: 'schoolinformation.sidebar',
    link: '/settings/schoolinformation',
    icon: SchoolInformation,
    color: 'bg-ciLightBlue',
  },
  {
    id: '11',
    name: 'schoolmanagement.sidebar',
    link: '/settings/schoolmanagement',
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
  },
  { id: '12', name: 'printer.sidebar', link: '/settings/printer', icon: Printer, color: 'bg-ciLightGreen' },
  { id: '13', name: 'network.sidebar', link: '/settings/network', icon: Network, color: 'bg-ciLightGreen' },
  {
    id: '14',
    name: 'locationservices.sidebar',
    link: '/settings/locationservices',
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: '15',
    name: 'desktopdeployment.sidebar',
    link: '/settings/desktopdeployment',
    icon: DesktopDeployment,
    color: 'bg-ciLightGreen',
  },
  { id: '16', name: 'wlan.sidebar', link: '/settings/wlan', icon: Wlan, color: 'bg-ciLightGreen' },
  {
    id: '17',
    name: 'mobiledevices.sidebar',
    link: '/settings/mobiledevices',
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: '18',
    name: 'virtualization.sidebar',
    link: '/settings/virtualization',
    icon: Virtualization,
    color: 'bg-ciLightGreen',
  },
  { id: '19', name: 'firewall.sidebar', link: '/settings/firewall', icon: Firewall, color: 'bg-ciGreenToBlue' },
  {
    id: '20',
    name: 'antimalware.sidebar',
    link: '/settings/antimalware',
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
  },
  { id: '21', name: 'backup.sidebar', link: '/settings/backup', icon: BackupIcon, color: 'bg-ciGreenToBlue' },
];
