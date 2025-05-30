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
import FEED_PULL_TIME_INTERVAL_SLOW from '@libs/dashboard/constants/pull-time-interval';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import APPS from '@libs/appconfig/constants/apps';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import useDockerContainerEvents from '@/hooks/useDockerContainerEvents';
import useIsAppActive from '@/hooks/useIsAppActive';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import UseBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import useSseStore from '@/store/useSseStore';
import useFileOperationProgress from '@/pages/FileSharing/hooks/useFileOperationProgress';
import useFileDownloadProgressToast from '@/pages/FileSharing/hooks/useFileDownloadProgressToast';
import useFileOperationToast from '@/pages/FileSharing/hooks/useFileOperationToast';

const useNotifications = () => {
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const isMailsAppActivated = useIsAppActive(APPS.MAIL);
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsAppActive(APPS.CONFERENCES);
  const { conferences, getConferences, setConferences } = useConferenceStore();
  const conferencesRef = useRef(conferences);
  const isSurveysAppActivated = useIsAppActive(APPS.SURVEYS);
  const { updateOpenSurveys } = useSurveyTablesPageStore();
  const isBulletinBoardActive = useIsAppActive(APPS.BULLETIN_BOARD);
  const { addBulletinBoardNotification } = UseBulletinBoardStore();
  const { eventSource } = useSseStore();

  useFileOperationProgress();

  useDockerContainerEvents();

  useFileDownloadProgressToast();

  useFileOperationToast();

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
    if (!isConferenceAppActivated || !eventSource) {
      return undefined;
    }
    const controller = new AbortController();
    const { signal } = controller;

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
            isRunning: type === SSE_MESSAGE_TYPE.CONFERENCE_STARTED,
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

    eventSource.addEventListener(SSE_MESSAGE_TYPE.CONFERENCE_CREATED, createConferenceHandler, { signal });
    eventSource.addEventListener(SSE_MESSAGE_TYPE.CONFERENCE_STARTED, updateConferenceHandler, { signal });
    eventSource.addEventListener(SSE_MESSAGE_TYPE.CONFERENCE_STOPPED, updateConferenceHandler, { signal });
    eventSource.addEventListener(SSE_MESSAGE_TYPE.CONFERENCE_DELETED, deleteConferenceHandler, { signal });

    return () => {
      controller.abort();
    };
  }, [isConferenceAppActivated]);

  useEffect(() => {
    if (!isSurveysAppActivated || !eventSource) {
      return undefined;
    }

    const controller = new AbortController();
    const { signal } = controller;

    const handleUpdateSurveys = () => {
      void updateOpenSurveys();
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.SURVEY_CREATED, handleUpdateSurveys, { signal });
    eventSource.addEventListener(SSE_MESSAGE_TYPE.SURVEY_UPDATED, handleUpdateSurveys, { signal });
    eventSource.addEventListener(SSE_MESSAGE_TYPE.SURVEY_DELETED, handleUpdateSurveys, { signal });

    return () => {
      controller.abort();
    };
  }, [isSurveysAppActivated]);

  useEffect(() => {
    if (!isBulletinBoardActive || !eventSource) {
      return undefined;
    }
    const controller = new AbortController();
    const { signal } = controller;

    const handleBulletinNotification = (e: MessageEvent<string>) => {
      const { data } = e;
      const bulletin = JSON.parse(data) as BulletinResponseDto;
      addBulletinBoardNotification(bulletin);
    };

    eventSource.addEventListener(SSE_MESSAGE_TYPE.BULLETIN_UPDATED, handleBulletinNotification, { signal });

    return () => {
      controller.abort();
    };
  }, [isBulletinBoardActive]);
};

export default useNotifications;
