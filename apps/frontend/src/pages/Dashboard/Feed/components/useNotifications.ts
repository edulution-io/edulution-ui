import { useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import useLdapGroups from '@/hooks/useLdapGroups';
import FEED_PULL_TIME_INTERVAL, { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import useIsConferenceActive from '@/pages/Dashboard/Feed/conferences/useIsConferenceActive';
import useIsSurveysActive from '@/pages/Surveys/useIsSurveysActive';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';

const useNotifications = () => {
  const { isSuperAdmin } = useLdapGroups();
  const isMailsAppActivated = useIsMailsActive();
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsConferenceActive();
  const { getConferences } = useConferenceStore();
  const isSurveysAppActivated = useIsSurveysActive();
  const { updateOpenSurveys } = useSurveyTablesPageStore();

  // interval fetch for the notifications (dashboard & sidebar)
  useInterval(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
  }, FEED_PULL_TIME_INTERVAL);
  useInterval(() => {
    if (isMailsAppActivated && !isSuperAdmin) {
      void getMails();
    }
    if (isSurveysAppActivated) {
      void updateOpenSurveys();
    }
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
    if (isMailsAppActivated && !isSuperAdmin) {
      void getMails();
    }
    if (isSurveysAppActivated) {
      void updateOpenSurveys();
    }
  }, []);
};

export default useNotifications;
