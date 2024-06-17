import { useSearchParams } from 'react-router-dom';
import { MenuBarEntryProps } from '@/datatypes/types';
import { PlusIcon, SurveysSidebarIcon } from '@/assets/icons';

const useSurveysPageMenu = () => {
  const [, setSearchParams] = useSearchParams();

  const menuBar = (): MenuBarEntryProps => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor',
        icon: PlusIcon,
        action: () => {
          setSearchParams({ page: 'editor' });
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
