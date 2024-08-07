import { useEffect, useMemo } from 'react';
import { useInterval } from 'usehooks-ts';
import FEED_PULL_TIME_INTERVAL, { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';
import SidebarNotifications from '@libs/dashboard/feed/common/types/sidebarNotfications';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import useIsConferenceActive from '@/pages/Dashboard/Feed/conferences/useIsConferenceActive';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';

const useNotifications = (): SidebarNotifications => {
  const { getMails, mails } = useMailsStore();
  const { getConferences, runningConferences } = useConferenceStore();

  const isMailsAppActivated = useIsMailsActive();
  const isConferenceAppActivated = useIsConferenceActive();

  useInterval(() => {
    if (isMailsAppActivated) {
      void getMails();
    }
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  useEffect(() => {
    if (isMailsAppActivated) {
      void getMails();
    }
  }, []);

  useInterval(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
  }, FEED_PULL_TIME_INTERVAL);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
  }, []);

  const mailsNotificationCounter = useMemo(() => mails.length || 0, [mails]);
  const runningConferencesNotificationCounter = useMemo(() => runningConferences.length || 0, [runningConferences]);

  return {
    mailsNotificationCounter,
    runningConferencesNotificationCounter,
  };
};

export default useNotifications;
