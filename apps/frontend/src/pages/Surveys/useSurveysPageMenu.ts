import { useSearchParams } from 'react-router-dom';
import SurveysPageView from '@libs/survey/types/api/page-view';
import { MenuBarEntryProps } from '@/datatypes/types';
import { UserIcon, PlusIcon, SurveysViewAnsweredIcon, SurveysViewOpenIcon, SurveysSidebarIcon } from '@/assets/icons';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';

const useSurveysPageMenu = () => {
  const [, setSearchParams] = useSearchParams();
  const { updateSelectedPageView } = useSurveyTablesPageStore();

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
          updateSelectedPageView(SurveysPageView.OPEN);
          setSearchParams({ page: SurveysPageView.OPEN });
        },
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.view.answered',
        icon: SurveysViewAnsweredIcon,
        action: () => {
          updateSelectedPageView(SurveysPageView.ANSWERED);
          setSearchParams({ page: SurveysPageView.ANSWERED });
        },
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.view.created',
        icon: UserIcon,
        action: () => {
          updateSelectedPageView(SurveysPageView.CREATED);
          setSearchParams({ page: SurveysPageView.CREATED });
        },
      },
      {
        id: 'survey-editor-view',
        label: 'surveys.view.editor',
        icon: PlusIcon,
        action: () => {
          updateSelectedPageView(SurveysPageView.CREATOR);
          setSearchParams({ page: SurveysPageView.CREATOR });
        },
      },
    ],
  });
  return menuBar();
};
export default useSurveysPageMenu;
