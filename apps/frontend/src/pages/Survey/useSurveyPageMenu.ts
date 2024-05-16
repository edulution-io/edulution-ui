import { SurveyIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';

const useSurveysPageMenu = () => {
  const menuBar = (): MenuBarEntryProps => ({
    title: 'survey.forms.title',
    icon: SurveyIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [],
  });

  return menuBar();
};

export default useSurveysPageMenu;
