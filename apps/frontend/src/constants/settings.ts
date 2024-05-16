import {
  AntiMalwareIcon,
  BackupIcon,
  ChatIcon,
  ConferencesIcon,
  DesktopDeploymentIcon,
  FileSharingIcon,
  FirewallIcon,
  ForumsIcon,
  KnowledgeBaseIcon,
  LearningManagementIcon,
  LocationServicesIcon,
  MailIcon,
  MobileDevicesIcon,
  NetworkIcon,
  PrinterIcon,
  RoomBookingIcon,
  SchoolInformationIcon,
  SchoolManagementIcon,
  SurveyIcon,
  TicketSystemIcon,
  VirtualizationIcon,
  WlanIcon,
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
  { id: APPS.MAIL, icon: MailIcon, color: 'bg-ciDarkBlue' },
  { id: APPS.CHAT, icon: ChatIcon, color: 'bg-ciDarkBlue' },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    color: 'bg-ciDarkBlue',
  },
  { id: APPS.SURVEYS, icon: SurveyIcon, color: 'bg-ciDarkBlue' },
  {
    id: APPS.KNOWLEDGE_BASE,
    icon: KnowledgeBaseIcon,
    color: 'bg-ciDarkBlue',
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharingIcon,
    color: 'bg-ciDarkBlue',
  },
  { id: APPS.FORUMS, icon: ForumsIcon, color: 'bg-ciDarkBlue' },
  {
    id: APPS.ROOM_BOOKING,
    icon: RoomBookingIcon,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.LEARNING_MANAGEMENT,
    icon: LearningManagementIcon,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.SCHOOL_INFORMATION,
    icon: SchoolInformationIcon,
    color: 'bg-ciLightBlue',
  },
  {
    id: APPS.SCHOOL_MANAGEMENT,
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
  },
  { id: APPS.PRINTER, icon: PrinterIcon, color: 'bg-ciLightGreen' },
  { id: APPS.NETWORK, icon: NetworkIcon, color: 'bg-ciLightGreen' },
  {
    id: APPS.LOCATION_SERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    color: 'bg-ciLightGreen',
  },
  { id: APPS.WLAN, icon: WlanIcon, color: 'bg-ciLightGreen' },
  {
    id: APPS.MOBILE_DEVICES,
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
  },
  {
    id: APPS.VIRTUALIZATION,
    icon: VirtualizationIcon,
    color: 'bg-ciLightGreen',
  },
  { id: APPS.FIREWALL, icon: FirewallIcon, color: 'bg-ciGreenToBlue' },
  {
    id: APPS.ANTIMALWARE,
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
  },
  { id: APPS.BACKUP, icon: BackupIcon, color: 'bg-ciGreenToBlue' },
];
