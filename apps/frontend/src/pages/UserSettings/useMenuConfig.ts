import { ExternalIntegration, FAQIcon, SecurityIcon, UserIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import { useSearchParams } from 'react-router-dom';

const useUserSettingsMenuConfig = () => {
  const [, setSearchParams] = useSearchParams();

  const USERSETTINGS_MENUBAR_CONFIG: MenuBarEntryProps = {
    title: 'usersettings.title',
    icon: UserIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'security',
        label: 'usersettings.security',
        icon: SecurityIcon,
        action: () => setSearchParams({ section: 'security' }),
      },
      {
        id: 'faq',
        label: 'usersettings.faq',
        icon: FAQIcon,
        action: () => setSearchParams({ section: 'faq' }),
      },
      {
        id: 'ExternalIntegration',
        label: 'usersettings.externalIntegration',
        icon: ExternalIntegration,
        action: () => setSearchParams({ section: 'ExternalIntegration' }),
      },
    ],
  };

  return USERSETTINGS_MENUBAR_CONFIG;
};

export default useUserSettingsMenuConfig;
