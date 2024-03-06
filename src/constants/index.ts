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
}

export const SETTINGS_APPSELECT_OPTIONS: Options[] = [
  { id: '1', name: 'ticketSystem.sidebar', link: '/settings/ticketsystem', icon: TicketSystemIcon },
  { id: '2', name: 'mail.sidebar', link: '/settings/mail', icon: Mail },
  { id: '3', name: 'chat.sidebar', link: '/settings/chat', icon: Chat },
  { id: '4', name: 'conferences.sidebar', link: '/settings/conferences', icon: Conferences },
  { id: '5', name: 'knowledgeBase.sidebar', link: '/settings/knowledgebase', icon: KnowledgeBase },
  { id: '6', name: 'fileSharing.sidebar', link: '/settings/filesharing', icon: FileSharing },
  { id: '7', name: 'forums.sidebar', link: '/settings/forums', icon: Forums },
  { id: '8', name: 'roomBooking.sidebar', link: '/settings/roombooking', icon: RoomBooking },
  { id: '9', name: 'learningManagement.sidebar', link: '/settings/learningmanagement', icon: LearningManagement },
  { id: '10', name: 'schoolInformation.sidebar', link: '/settings/schoolinformation', icon: SchoolInformation },
  { id: '11', name: 'schoolManagement.sidebar', link: '/settings/schoolmanagement', icon: SchoolManagementIcon },
  { id: '12', name: 'printer.sidebar', link: '/settings/printer', icon: Printer },
  { id: '13', name: 'network.sidebar', link: '/settings/network', icon: Network },
  { id: '14', name: 'locationServices.sidebar', link: '/settings/locationservices', icon: LocationServicesIcon },
  { id: '15', name: 'desktopDeployment.sidebar', link: '/settings/desktopdeployment', icon: DesktopDeployment },
  { id: '16', name: 'wlan.sidebar', link: '/settings/wlan', icon: Wlan },
  { id: '17', name: 'mobileDevices.sidebar', link: '/settings/mobiledevices', icon: MobileDevicesIcon },
  { id: '18', name: 'virtualization.sidebar', link: '/settings/virtualization', icon: Virtualization },
  { id: '19', name: 'firewall.sidebar', link: '/settings/firewall', icon: Firewall },
  { id: '20', name: 'antiMalware.sidebar', link: '/settings/antimalware', icon: AntiMalwareIcon },
  { id: '21', name: 'backup.sidebar', link: '/settings/backup', icon: BackupIcon },
];
