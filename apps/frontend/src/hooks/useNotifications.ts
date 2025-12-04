/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import useLdapGroups from '@/hooks/useLdapGroups';
import FEED_PULL_TIME_INTERVAL_SLOW from '@libs/dashboard/constants/pull-time-interval';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/useConferenceStore';
import useSurveysTablesPageStore from '@/pages/Surveys/Tables/useSurveysTablesPageStore';
import APPS from '@libs/appconfig/constants/apps';
import ConferenceDto from '@libs/conferences/types/conference.dto';
import useDockerContainerEvents from '@/hooks/useDockerContainerEvents';
import useIsAppActive from '@/hooks/useIsAppActive';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import UseBulletinBoardStore from '@/pages/BulletinBoard/useBulletinBoardStore';
import BulletinResponseDto from '@libs/bulletinBoard/types/bulletinResponseDto';
import useFileOperationProgress from '@/pages/FileSharing/hooks/useFileOperationProgress';
import useFileOperationToast from '@/pages/FileSharing/hooks/useFileOperationToast';
import useTLDRawHistoryStore from '@/pages/Whiteboard/TLDrawWithSync/useTLDRawHistoryStore';
import HistoryEntryDto from '@libs/whiteboard/types/historyEntryDto';
import useFileDownloadProgressToast from '@/hooks/useDownloadProgressToast';
import { toast } from 'sonner';
import useSseEventListener from '@/hooks/useSseEventListener';
import useSseHeartbeatMonitor from '@/hooks/useSseHeartbeatMonitor';

const useNotifications = () => {
  const { t } = useTranslation();
  const { isSuperAdmin, isAuthReady } = useLdapGroups();
  const isMailsAppActivated = useIsAppActive(APPS.MAIL);
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsAppActive(APPS.CONFERENCES);
  const { conferences, getConferences, setConferences } = useConferenceStore();
  const conferencesRef = useRef(conferences);
  const isSurveysAppActivated = useIsAppActive(APPS.SURVEYS);
  const { updateOpenSurveys } = useSurveysTablesPageStore();
  const isBulletinBoardActive = useIsAppActive(APPS.BULLETIN_BOARD);
  const { addBulletinBoardNotification } = UseBulletinBoardStore();
  const isWhiteboardActive = useIsAppActive(APPS.WHITEBOARD);
  const { addRoomHistoryEntry } = useTLDRawHistoryStore();

  useFileOperationProgress();

  useDockerContainerEvents();

  useFileDownloadProgressToast();

  useFileOperationToast();

  useSseHeartbeatMonitor();

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

  const handleMailThemeUpdated = () => {
    toast.info(t('mail.themeUpdated.generic'), {
      action: {
        label: t('common.refreshPage'),
        onClick: () => window.location.reload(),
      },
      duration: undefined,
    });
  };

  const handleMailThemeUpdateFailed = () => toast.error(t('mail.themeUpdated.failed'));

  useSseEventListener(SSE_MESSAGE_TYPE.MAIL_THEME_UPDATED, handleMailThemeUpdated, {
    enabled: isMailsAppActivated,
  });

  useSseEventListener(SSE_MESSAGE_TYPE.MAIL_THEME_UPDATE_FAILED, handleMailThemeUpdateFailed, {
    enabled: isMailsAppActivated,
  });

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

  useSseEventListener(SSE_MESSAGE_TYPE.CONFERENCE_CREATED, createConferenceHandler, {
    enabled: isConferenceAppActivated,
  });

  useSseEventListener(
    [SSE_MESSAGE_TYPE.CONFERENCE_STARTED, SSE_MESSAGE_TYPE.CONFERENCE_STOPPED],
    updateConferenceHandler,
    { enabled: isConferenceAppActivated },
  );

  useSseEventListener(SSE_MESSAGE_TYPE.CONFERENCE_DELETED, deleteConferenceHandler, {
    enabled: isConferenceAppActivated,
  });

  const handleUpdateSurveys = () => {
    void updateOpenSurveys();
  };

  useSseEventListener(
    [SSE_MESSAGE_TYPE.SURVEY_CREATED, SSE_MESSAGE_TYPE.SURVEY_UPDATED, SSE_MESSAGE_TYPE.SURVEY_DELETED],
    handleUpdateSurveys,
    { enabled: isSurveysAppActivated },
  );

  const handleBulletinNotification = (e: MessageEvent<string>) => {
    const { data } = e;
    const bulletin = JSON.parse(data) as BulletinResponseDto;
    addBulletinBoardNotification(bulletin);
  };

  useSseEventListener(SSE_MESSAGE_TYPE.BULLETIN_UPDATED, handleBulletinNotification, {
    enabled: isBulletinBoardActive,
  });

  const handleNewHistoryLog = (e: MessageEvent<string>) => {
    const entry = JSON.parse(e.data) as HistoryEntryDto;
    addRoomHistoryEntry(entry);
  };

  useSseEventListener(SSE_MESSAGE_TYPE.TLDRAW_SYNC_ROOM_LOG_MESSAGE, handleNewHistoryLog, {
    enabled: isWhiteboardActive,
  });
};

export default useNotifications;
