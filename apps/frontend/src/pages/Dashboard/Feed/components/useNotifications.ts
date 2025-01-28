import { useEffect, useRef } from 'react';
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
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import APPS from '@libs/appconfig/constants/apps';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { CONFERENCES_SSE_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import useDockerContainerEvents from '@/hooks/useDockerContainerEvents';

const useNotifications = () => {
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const { eduApiToken } = useUserStore();
  const isMailsAppActivated = useIsMailsActive();
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsConferenceActive();
  const { conferences, getConferences, setConferences } = useConferenceStore();
  const conferencesRef = useRef(conferences);
  const isSurveysAppActivated = useIsSurveysActive();
  const { updateOpenSurveys } = useSurveyTablesPageStore();

  useDockerContainerEvents();

  useEffect(() => {
    conferencesRef.current = conferences;
  }, [conferences]);

  useEffect(() => {
    if (isAuthReady) {
      if (isMailsAppActivated && !isSuperAdmin) {
        void getMails();
      }

      if (isSurveysAppActivated) {
        void updateOpenSurveys();
      }

      if (isConferenceAppActivated) {
        void getConferences();
      }
    }
  }, [isAuthReady, isMailsAppActivated, isSuperAdmin, isSurveysAppActivated, isConferenceAppActivated]);

  useInterval(() => {
    if (isAuthReady && isMailsAppActivated && !isSuperAdmin) {
      void getMails();
    }
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  useEffect(() => {
    if (isConferenceAppActivated) {
      const eventSource = new EventSource(`/${EDU_API_ROOT}/${CONFERENCES_SSE_EDU_API_ENDPOINT}?token=${eduApiToken}`);

      const createConferenceHandler = (e: MessageEvent<string>) => {
        const conferenceDto = JSON.parse(e.data) as ConferenceDto;
        const newConferences = [...conferencesRef.current, conferenceDto];
        setConferences(newConferences);
      };

      const updateConferenceHandler = (e: MessageEvent<string>) => {
        if (conferencesRef.current.length === 0) return;
        const { type, data } = e;
        const newConferences = conferencesRef.current.map((conference) => {
          if (conference.meetingID === data) {
            return {
              ...conference,
              isRunning: type === 'started',
            };
          }
          return conference;
        });
        setConferences(newConferences);
      };

      const deleteConferenceHandler = (e: MessageEvent<string[]>) => {
        const { data } = e;
        const newConferences = conferencesRef.current.filter((conference) => !data.includes(conference.meetingID));
        setConferences(newConferences);
      };

      eventSource.addEventListener('created', createConferenceHandler);
      eventSource.addEventListener('started', updateConferenceHandler);
      eventSource.addEventListener('stopped', updateConferenceHandler);
      eventSource.addEventListener('deleted', deleteConferenceHandler);

      return () => {
        eventSource.removeEventListener('created', createConferenceHandler);
        eventSource.removeEventListener('started', updateConferenceHandler);
        eventSource.removeEventListener('stopped', updateConferenceHandler);
        eventSource.removeEventListener('deleted', deleteConferenceHandler);

        eventSource.close();
      };
    }

    return undefined;
  }, [isConferenceAppActivated, eduApiToken]);

  useEffect(() => {
    if (isSurveysAppActivated) {
      const eventSource = new EventSource(`/${EDU_API_ROOT}/${APPS.SURVEYS}/sse?token=${eduApiToken}`);

      eventSource.onmessage = () => {
        void updateOpenSurveys();
      };

      return () => {
        eventSource.close();
      };
    }

    return undefined;
  }, [isSurveysAppActivated, eduApiToken]);
};

export default useNotifications;
