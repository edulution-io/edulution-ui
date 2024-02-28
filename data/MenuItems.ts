import Conferences from '@/assets/icons/edulution/Konferenzen.svg';
import Firewall from '@/assets/icons/firewall-light.svg';
import Virtualization from '@/assets/icons/edulution/Computer_Steuerung.svg';
import LearningManagement from '@/assets/icons/edulution/Lernmanagement.svg';
import FileSharing from '@/assets/icons/edulution/Filesharing.svg';
import DesktopDeployment from '@/assets/icons/edulution/Virtual_Desktop.svg';
import Network from '@/assets/icons/edulution/Netzwerk.svg';
import Mail from '@/assets/icons/edulution/Mail.svg';
import SchoolInformation from '@/assets/icons/edulution/Information.svg';
import Printer from '@/assets/icons/edulution/Drucker.svg';
import RoomBooking from '@/assets/icons/edulution/Raumbuchung.svg';
import Forums from '@/assets/icons/edulution/Foren.svg';
import Chat from '@/assets/icons/edulution/Chat.svg';
import Wlan from '@/assets/icons/edulution/Wlan.svg';
import KnowledgeBase from '@/assets/icons/edulution/Wissensdatenbank.svg';
import { translateKey } from '@/utils/common';

const MENU_ITEMS = [
  {
    title: translateKey('conferences'),
    link: '/conferences',
    icon: Conferences,
  },
  {
    title: translateKey('firewall'),
    link: '/firewall',
    icon: Firewall,
  },
  {
    title: translateKey('virtualization'),
    link: '/virtualization',
    icon: Virtualization,
  },
  {
    title: translateKey('learningManagement'),
    link: '/learning-management',
    icon: LearningManagement,
  },
  {
    title: translateKey('fileSharing'),
    link: '/file-sharing',
    icon: FileSharing,
  },
  {
    title: translateKey('desktopDeployment'),
    link: '/desktop-deployment',
    icon: DesktopDeployment,
  },
  {
    title: translateKey('network'),
    link: '/network',
    icon: Network,
  },
  {
    title: translateKey('mail'),
    link: '/mail',
    icon: Mail,
  },
  {
    title: translateKey('schoolInformation'),
    link: '/school-information',
    icon: SchoolInformation,
  },
  {
    title: translateKey('printer'),
    link: '/printer',
    icon: Printer,
  },
  {
    title: translateKey('roomBooking'),
    link: '/room-booking',
    icon: RoomBooking,
  },
  {
    title: translateKey('forums'),
    link: '/forums',
    icon: Forums,
  },
  {
    title: translateKey('chat'),
    link: '/chat',
    icon: Chat,
  },
  {
    title: translateKey('wlan'),
    link: '/wlan',
    icon: Wlan,
  },
  {
    title: translateKey('knowledgeBase'),
    link: '/knowledge-base',
    icon: KnowledgeBase,
  },
];

export default MENU_ITEMS;
