import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view';
import { PlusIcon, SurveysSidebarIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, UserIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useSurveysPageMenu = () => {
  const [, setSearchParams] = useSearchParams();

  const menuBar = (): MenuBarEntry => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.SURVEYS,
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
