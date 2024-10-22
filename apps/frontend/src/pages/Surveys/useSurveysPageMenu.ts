import { useNavigate } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view';
import SURVEYS_ENDPOINT from '@libs/survey/constants/surveys-endpoint';
import { MenuBarEntryProps } from '@/datatypes/types';
import { UserIcon, PlusIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, SurveysSidebarIcon } from '@/assets/icons';

const useSurveysPageMenu = () => {
  const navigate = useNavigate();

  const menuBar = (): MenuBarEntryProps => ({
    title: 'surveys.title',
    icon: SurveysSidebarIcon,
    color: 'hover:bg-ciGreenToBlue',
    menuItems: [
      {
        id: 'overview-open-surveys',
        label: 'surveys.view.open',
        icon: SurveysViewOpenIcon,
        action: () => {
          navigate(`${SURVEYS_ENDPOINT}${SurveysPageView.OPEN}`);
        },
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.view.answered',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          navigate(`${SURVEYS_ENDPOINT}${SurveysPageView.ANSWERED}`);
        },
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.view.created',
        icon: UserIcon,
        action: () => {
          navigate(`${SURVEYS_ENDPOINT}${SurveysPageView.CREATED}`);
        },
      },
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor',
        icon: PlusIcon,
        action: () => {
          navigate(`${SURVEYS_ENDPOINT}${SurveysPageView.CREATOR}`);
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
