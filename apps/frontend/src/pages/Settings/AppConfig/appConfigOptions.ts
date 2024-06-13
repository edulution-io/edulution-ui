import {
  AiChatIcon,
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
  LinuxmusterIcon,
  LocationServicesIcon,
  MailIcon,
  MobileDevicesIcon,
  NetworkIcon,
  PrinterIcon,
  RoomBookingIcon,
  SchoolInformationIcon,
  SchoolManagementIcon,
  SurveysSidebarIcon,
  TicketSystemIcon,
  VirtualizationIcon,
  WhiteBoardIcon,
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
  { id: APPS.WHITEBOARD, icon: WhiteBoardIcon, color: 'bg-ciDarkBlue', options: ['url'] },
  { id: APPS.CHAT, icon: ChatIcon, color: 'bg-ciDarkBlue', options: ['url'] },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'apiKey'],
  },
  { id: APPS.SURVEYS, icon: SurveysSidebarIcon, color: 'bg-ciDarkBlue' },
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
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  {
    id: APPS.LEARNING_MANAGEMENT,
    icon: LearningManagementIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  {
    id: APPS.SCHOOL_INFORMATION,
    icon: SchoolInformationIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  {
    id: APPS.SCHOOL_MANAGEMENT,
    icon: SchoolManagementIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  { id: APPS.PRINTER, icon: PrinterIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
  { id: APPS.NETWORK, icon: NetworkIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
  {
    id: APPS.LOCATION_SERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  { id: APPS.WLAN, icon: WlanIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
  {
    id: APPS.MOBILE_DEVICES,
    icon: MobileDevicesIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
  },
  {
    id: APPS.VIRTUALIZATION,
    icon: VirtualizationIcon,
    color: 'bg-ciGreenToBlue',
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
  { id: APPS.AICHAT, icon: AiChatIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
  { id: APPS.LINUXMUSTER, icon: LinuxmusterIcon, color: 'bg-ciGreenToBlue', options: ['url'] },
];

export default APP_CONFIG_OPTIONS;
