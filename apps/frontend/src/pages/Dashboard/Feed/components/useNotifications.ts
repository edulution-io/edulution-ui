import { useEffect } from 'react';
import { useInterval } from 'usehooks-ts';
import useLdapGroups from '@/hooks/useLdapGroups';
import useMailsStore from '@/pages/Mail/useMailsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useIsMailsActive from '@/pages/Mail/useIsMailsActive';
import useIsConferenceActive from '@/pages/Dashboard/Feed/conferences/useIsConferenceActive';
import FEED_PULL_TIME_INTERVAL, { FEED_PULL_TIME_INTERVAL_SLOW } from '@libs/dashboard/constants/pull-time-interval';

const useNotifications = () => {
  const { isSuperAdmin } = useLdapGroups();
  const isMailsAppActivated = useIsMailsActive();
  const { getMails } = useMailsStore();
  const isConferenceAppActivated = useIsConferenceActive();
  const { getConferences } = useConferenceStore();

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
  }, FEED_PULL_TIME_INTERVAL_SLOW);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined);
    }
    if (isMailsAppActivated && !isSuperAdmin) {
      void getMails();
    }
  }, []);
};

export default useNotifications;
