import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view-enum';
import { MenuBarEntryProps } from '@/datatypes/types';
import { UserIcon, PlusIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, SurveysSidebarIcon } from '@/assets/icons';

const useSurveysPageMenu = () => {
  const [, setSearchParams] = useSearchParams();

  const menuBar = (): MenuBarEntryProps => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'overview-open-surveys',
        label: 'surveys.view.open',
        icon: SurveysViewOpenIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.OPEN });
        },
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.view.answered',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.ANSWERED });
        },
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.view.created',
        icon: UserIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.CREATED });
        },
      },
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor',
        icon: PlusIcon,
        action: () => {
          setSearchParams({ page: SurveysPageView.CREATOR });
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
