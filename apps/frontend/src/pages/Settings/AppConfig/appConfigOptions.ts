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
  SurveyPageIcon,
  TicketSystemIcon,
  VirtualizationIcon,
  WlanIcon,
} from '@/assets/icons';
import { APPS } from '@/datatypes/types';
import { AppConfigOptionType } from '@/datatypes/appConfigOptions';

type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  options?: AppConfigOptionType[];
};

export const APP_CONFIG_OPTIONS: AppConfigOption[] = [
  {
    id: APPS.TICKET_SYSTEM,
    icon: TicketSystemIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
  },
  { id: APPS.MAIL, icon: MailIcon, color: 'bg-ciDarkBlue', options: ['url'] },
  { id: APPS.CHAT, icon: ChatIcon, color: 'bg-ciDarkBlue', options: ['url'] },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'apiKey'],
  },
  { id: APPS.SURVEYS, icon: SurveyPageIcon, color: 'bg-ciDarkBlue' },
  {
    id: APPS.KNOWLEDGE_BASE,
    icon: KnowledgeBaseIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharingIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
  },
  { id: APPS.FORUMS, icon: ForumsIcon, color: 'bg-ciDarkBlue', options: ['url'] },
  {
    id: APPS.ROOM_BOOKING,
    icon: RoomBookingIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
  },
  {
    id: APPS.LEARNING_MANAGEMENT,
    icon: LearningManagementIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
  },
  {
    id: APPS.SCHOOL_INFORMATION,
    icon: SchoolInformationIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
  },
  {
    id: APPS.SCHOOL_MANAGEMENT,
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
  },
  { id: APPS.PRINTER, icon: PrinterIcon, color: 'bg-ciLightGreen', options: ['url'] },
  { id: APPS.NETWORK, icon: NetworkIcon, color: 'bg-ciLightGreen', options: ['url'] },
  {
    id: APPS.LOCATION_SERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
  },
  { id: APPS.WLAN, icon: WlanIcon, color: 'bg-ciLightGreen', options: ['url'] },
  {
    id: APPS.MOBILE_DEVICES,
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
  },
  {
    id: APPS.VIRTUALIZATION,
    icon: VirtualizationIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
  },
  { id: APPS.FIREWALL, icon: FirewallIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
  {
    id: APPS.ANTIMALWARE,
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  { id: APPS.BACKUP, icon: BackupIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
];

export default APP_CONFIG_OPTIONS;
