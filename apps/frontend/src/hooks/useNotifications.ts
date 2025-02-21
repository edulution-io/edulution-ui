/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { useEffect, useRef } from 'react';
import { useInterval } from 'usehooks-ts';
import useLdapGroups from '@/hooks/useLdapGroups';
import { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import useUserStore from '@/store/UserStore/UserStore';
import EDU_API_ROOT from '@libs/common/constants/eduApiRoot';
import APPS from '@libs/appconfig/constants/apps';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import { CONFERENCES_SSE_EDU_API_ENDPOINT } from '@libs/conferences/constants/apiEndpoints';
import useDockerContainerEvents from '@/hooks/useDockerContainerEvents';
import useIsAppActive from '@/hooks/useIsAppActive';
import { BULLETIN_BOARD_SSE_EDU_API_ENDPOINT } from '@libs/bulletinBoard/constants/apiEndpoints';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import UseBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';

const useNotifications = () => {
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const { eduApiToken } = useUserStore();
  const isMailsAppActivated = useIsAppActive(APPS.MAIL);
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsAppActive(APPS.CONFERENCES);
  const { conferences, getConferences, setConferences } = useConferenceStore();
  const conferencesRef = useRef(conferences);
  const isSurveysAppActivated = useIsAppActive(APPS.SURVEYS);
  const { updateOpenSurveys } = useSurveyTablesPageStore();
  const isBulletinBoardActive = useIsAppActive(APPS.BULLETIN_BOARD);
  const { addBulletinBoardNotification } = UseBulletinBoardStore();

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
              isRunning: type === SSE_MESSAGE_TYPE.STARTED,
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

      eventSource.addEventListener(SSE_MESSAGE_TYPE.CREATED, createConferenceHandler);
      eventSource.addEventListener(SSE_MESSAGE_TYPE.STARTED, updateConferenceHandler);
      eventSource.addEventListener(SSE_MESSAGE_TYPE.STOPPED, updateConferenceHandler);
      eventSource.addEventListener(SSE_MESSAGE_TYPE.DELETED, deleteConferenceHandler);

      return () => {
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.CREATED, createConferenceHandler);
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.STARTED, updateConferenceHandler);
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.STOPPED, updateConferenceHandler);
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.DELETED, deleteConferenceHandler);

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

  useEffect(() => {
    if (isBulletinBoardActive) {
      const eventSource = new EventSource(
        `/${EDU_API_ROOT}/${BULLETIN_BOARD_SSE_EDU_API_ENDPOINT}?token=${eduApiToken}`,
      );

      const handleBulletinNotification = (e: MessageEvent<string>) => {
        const { data } = e;
        const bulletin = JSON.parse(data) as BulletinResponseDto;
        addBulletinBoardNotification(bulletin);
      };

      eventSource.addEventListener(SSE_MESSAGE_TYPE.CREATED, handleBulletinNotification);
      eventSource.addEventListener(SSE_MESSAGE_TYPE.UPDATED, handleBulletinNotification);

      return () => {
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.CREATED, handleBulletinNotification);
        eventSource.removeEventListener(SSE_MESSAGE_TYPE.UPDATED, handleBulletinNotification);
        eventSource.close();
      };
    }

    return undefined;
  }, [isBulletinBoardActive, eduApiToken]);
};

export default useNotifications;
