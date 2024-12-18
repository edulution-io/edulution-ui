import { useNavigate } from 'react-router-dom';
import {
  ANSWERED_SURVEYS_PAGE,
  CREATED_SURVEYS_PAGE,
  CREATOR_SURVEYS_PAGE,
  OPEN_SURVEYS_PAGE,
} from '@libs/survey/constants/surveys-endpoint';
import { UserIcon, PlusIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, SurveysSidebarIcon } from '@/assets/icons';
import MenuBarEntry from '@libs/menubar/menuBarEntry';
import APPS from '@libs/appconfig/constants/apps';

const useSurveysPageMenu = () => {
  const navigate = useNavigate();

  const menuBar = (): MenuBarEntry => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciGreenToBlue',
    appName: APPS.SURVEYS,
    menuItems: [
      {
        id: 'overview-open-surveys',
        label: 'surveys.view.open.menu',
        icon: SurveysViewOpenIcon,
        action: () => {
          navigate(OPEN_SURVEYS_PAGE);
        },
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.view.answered.menu',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          navigate(ANSWERED_SURVEYS_PAGE);
        },
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.view.created.menu',
        icon: UserIcon,
        action: () => {
          navigate(CREATED_SURVEYS_PAGE);
        },
      },
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor.menu',
        icon: PlusIcon,
        action: () => {
          navigate(CREATOR_SURVEYS_PAGE);
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
