import { useEffect } from 'react';
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
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
  }, FEED_PULL_TIME_INTERVAL);
  useInterval(() => {
    if (isMailsAppActivated) {
      void getMails();
    }
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
    if (isMailsAppActivated) {
      void getMails();
    }
  }, []);

  const mailsNotificationCounter = mails.length || 0;
  const runningConferencesNotificationCounter = runningConferences.length || 0;

  return {
    mailsNotificationCounter,
    runningConferencesNotificationCounter,
  };
};

export default useNotifications;