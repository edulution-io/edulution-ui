import AvailableNotificationModule from '@libs/notification/types/availableNotificationModule';
import { BulletinBoardIcon, ConferencesIcon, SurveysMenuIcon } from '@/assets/icons';

const AvailableNotificationModules: AvailableNotificationModule[] = [
  {
    id: 'conferences',
    icon: ConferencesIcon,
    labelKey: 'usersettings.notifications.modules.conferences',
  },
  {
    id: 'survey',
    icon: SurveysMenuIcon,
    labelKey: 'usersettings.notifications.modules.survey',
  },
  {
    id: 'bulletinBoard',
    icon: BulletinBoardIcon,
    labelKey: 'usersettings.notifications.modules.bulletinBoard',
  },
];

export default AvailableNotificationModules;
