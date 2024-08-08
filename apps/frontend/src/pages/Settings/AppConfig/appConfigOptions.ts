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
  TicketSystemIcon,
  VirtualizationIcon,
  WhiteBoardIcon,
  WlanIcon,
  license01,
} from '@/assets/icons';
import { AppConfigOptionType, APPS } from '@libs/appconfig/types';

type AppConfigOption = {
  id: string;
  icon: string;
  color: string;
  isNativeApp: boolean;
  options?: AppConfigOptionType[];
};

export const APP_CONFIG_OPTIONS: AppConfigOption[] = [
  {
    id: APPS.TICKET_SYSTEM,
    icon: TicketSystemIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.MAIL,
    icon: MailIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
    isNativeApp: true,
  },
  { id: APPS.CHAT, icon: ChatIcon, color: 'bg-ciDarkBlue', options: ['url'], isNativeApp: false },
  {
    id: APPS.CONFERENCES,
    icon: ConferencesIcon,
    color: 'bg-ciDarkBlue',
    options: ['url', 'apiKey'],
    isNativeApp: true,
  },
  {
    id: APPS.KNOWLEDGE_BASE,
    icon: KnowledgeBaseIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.FILE_SHARING,
    icon: FileSharingIcon,
    color: 'bg-ciDarkBlue',
    options: ['url'],
    isNativeApp: true,
  },
  { id: APPS.FORUMS, icon: ForumsIcon, color: 'bg-ciDarkBlue', options: ['url'], isNativeApp: false },
  {
    id: APPS.ROOM_BOOKING,
    icon: RoomBookingIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.LEARNING_MANAGEMENT,
    icon: LearningManagementIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.SCHOOL_INFORMATION,
    icon: SchoolInformationIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.SCHOOL_MANAGEMENT,
    icon: SchoolManagementIcon,
    color: 'bg-ciLightBlue',
    options: ['url'],
    isNativeApp: false,
  },
  { id: APPS.PRINTER, icon: PrinterIcon, color: 'bg-ciLightGreen', options: ['url'], isNativeApp: false },
  { id: APPS.NETWORK, icon: NetworkIcon, color: 'bg-ciLightGreen', options: ['url'], isNativeApp: false },
  {
    id: APPS.LOCATION_SERVICES,
    icon: LocationServicesIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.DESKTOP_DEPLOYMENT,
    icon: DesktopDeploymentIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
    isNativeApp: true,
  },
  { id: APPS.WLAN, icon: WlanIcon, color: 'bg-ciLightGreen', options: ['url'], isNativeApp: false },
  {
    id: APPS.MOBILE_DEVICES,
    icon: MobileDevicesIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
    isNativeApp: false,
  },
  {
    id: APPS.VIRTUALIZATION,
    icon: VirtualizationIcon,
    color: 'bg-ciLightGreen',
    options: ['url'],
    isNativeApp: false,
  },
  { id: APPS.FIREWALL, icon: FirewallIcon, color: 'bg-ciGreenToBlue', options: ['url'], isNativeApp: false },
  {
    id: APPS.ANTIMALWARE,
    icon: AntiMalwareIcon,
    color: 'bg-ciGreenToBlue',
    options: ['url'],
    isNativeApp: false,
  },
  { id: APPS.BACKUP, icon: BackupIcon, color: 'bg-ciGreenToBlue', options: ['url'], isNativeApp: false },
  { id: APPS.AICHAT, icon: AiChatIcon, color: 'bg-ciGreenToBlue', options: ['url'], isNativeApp: false },
  { id: APPS.LINUXMUSTER, icon: LinuxmusterIcon, color: 'bg-ciGreenToBlue', options: ['url'], isNativeApp: true },
  { id: APPS.WHITEBOARD, icon: WhiteBoardIcon, color: 'bg-ciDarkBlue', isNativeApp: true },
  { id: APPS.LICENSING, icon: license01, color: 'bg-ciDarkBlue', options: ['url'], isNativeApp: true },
];

export default APP_CONFIG_OPTIONS;
