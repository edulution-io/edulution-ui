import {
  AnsweredSurveysPageIcon,
  CreatedSurveysPageIcon, ManageSurveysPageIcon,
  OpenSurveysPageIcon,
  SurveyCreatorPageIcon,
  SurveyIcon,
  SurveyPageMenuIcon
} from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types.ts';
import useSurveysPageStore from '@/pages/Surveys/SurveysPageStore.ts';

const useSurveysPageMenu = () => {
  const { setPageViewOpenSurveys, setPageViewAnsweredSurveys, setPageViewCreatedSurveys, setPageViewSurveyCreator, setPageViewSurveysManagement } = useSurveysPageStore();

  const menuBar = (): MenuBarEntryProps => ({
    title: 'surveys.title',
    icon: SurveyPageMenuIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'overview-open-surveys',
        label: 'surveys.openSurveys',
        icon: OpenSurveysPageIcon,
        action: () => setPageViewOpenSurveys(),
      },
      {
        id: 'overview-answered-surveys',
        label: 'surveys.answeredSurveys',
        icon: AnsweredSurveysPageIcon,
        action: () => setPageViewAnsweredSurveys(),
      },
      {
        id: 'overview-created-surveys',
        label: 'surveys.createdSurveys',
        icon: CreatedSurveysPageIcon,
        action: () => setPageViewCreatedSurveys(),
      },
      {
        id: 'survey-editor-view',
        label: 'survey.create',
        icon: SurveyCreatorPageIcon,
        action: () => setPageViewSurveyCreator(),
      },
      {
        id: 'surveys-management',
        label: 'survey.manage',
        icon: SurveyIcon || ManageSurveysPageIcon,
        action: () => setPageViewSurveysManagement(),
      },
    ],
  });

  return menuBar();
};

export default useSurveysPageMenu;
