import { SurveyIcon, PollIcon, SurveyPageMenuIcon } from '@/assets/icons';
import { MenuBarEntryProps } from '@/datatypes/types';
import useQuestionsAndExercisesStore from '@/pages/PollsAndSurveysPage/PollsAndSurveysPageStore.ts';

const usePollsAndSurveysPageMenu = () => {
  const { setPageViewSurveyPage, setPageViewPollPage } = useQuestionsAndExercisesStore();

  const menuBar = (): MenuBarEntryProps => ({
    title: 'surveys.title',
    icon: SurveyPageMenuIcon,
    color: 'hover:bg-ciDarkBlue',
    menuItems: [
      {
        id: 'poll-overview',
        label: 'surveys.polls.sidebar',
        icon: PollIcon,
        action: () => setPageViewPollPage(),
      },
      {
        id: 'survey-overview',
        label: 'surveys.surveys.sidebar',
        icon: SurveyIcon,
        action: () => setPageViewSurveyPage(),
      },
    ],
  });

  return menuBar();
};

export default usePollsAndSurveysPageMenu;
