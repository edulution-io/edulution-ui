import { useNavigate } from 'react-router-dom';
import {
  ANSWERED_SURVEYS_PAGE,
  CREATED_SURVEYS_PAGE,
  CREATOR_SURVEYS_PAGE,
  OPEN_SURVEYS_PAGE,
} from '@libs/survey/constants/surveys-endpoint';
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
          navigate(OPEN_SURVEYS_PAGE);
        },
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.view.answered',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          navigate(ANSWERED_SURVEYS_PAGE);
        },
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.view.created',
        icon: UserIcon,
        action: () => {
          navigate(CREATED_SURVEYS_PAGE);
        },
      },
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor',
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
