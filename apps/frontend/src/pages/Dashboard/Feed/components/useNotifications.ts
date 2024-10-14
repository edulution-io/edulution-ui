import { useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import useLdapGroups from '@/hooks/useLdapGroups';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import useIsConferenceActive from '@/pages/ConferencePage/useIsConferenceActive';
import useIsSurveysActive from '@/pages/Surveys/useIsSurveysActive';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useUserStore from '@/store/UserStore/UserStore';

const useNotifications = () => {
  const { isSuperAdmin } = useLdapGroups();
  const { eduApiToken } = useUserStore();
  const isMailsAppActivated = useIsMailsActive();
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsConferenceActive();
  const { getConferences } = useConferenceStore();
  const isSurveysAppActivated = useIsSurveysActive();
  const { updateOpenSurveys } = useSurveyTablesPageStore();

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
      const eventSource = new EventSource(`${window.location.origin}/edu-api/conferences/sse?token=${eduApiToken}`);

      eventSource.onmessage = () => {
        void getConferences();
      };

      return () => {
        eventSource.close();
      };
    }

    return undefined;
  }, [isConferenceAppActivated]);

  useEffect(() => {
    if (isMailsAppActivated && !isSuperAdmin) {
      void getMails();
    }

    if (isSurveysAppActivated) {
      void updateOpenSurveys();
    }
  }, [isMailsAppActivated, isSuperAdmin, isSurveysAppActivated]);
};

export default useNotifications;
