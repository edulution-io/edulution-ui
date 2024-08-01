import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import { ConferencesIcon } from '@/assets/icons';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import FEED_PULL_TIME_INTERVAL from '@libs/dashboard/constants/pull-time-interval';
import { AccordionContent, AccordionItem } from '@/components/ui/Accordion';
import RunningConferencesList from '@/pages/Dashboard/Feed/conferences/RunningConferencesList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useSidebarNotificationStore from '@/store/useSidebarNotificationStore';

const RunningConferencesAccordionItem = () => {
  const { appConfigs } = useAppConfigsStore();

  const { updateAppData, resetAppData } = useSidebarNotificationStore();

  const { runningConferences, getConferences } = useConferenceStore();

  const { t } = useTranslation();

  // TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
  const isConferenceAppActivated = useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.CONFERENCES.toString()),
    [appConfigs],
  );

  useInterval(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined, updateAppData, resetAppData);
    }
  }, FEED_PULL_TIME_INTERVAL);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences(undefined, updateAppData, resetAppData);
    }
  }, []);

  if (!isConferenceAppActivated) {
    return null;
  }

  return (
    <AccordionItem value={APPS.CONFERENCES}>
      <FeedWidgetAccordionTrigger
        src={ConferencesIcon}
        alt={`${APPS.CONFERENCES}-notification-icon`}
        labelTranslationId="conferences.sidebar"
      />
      <AccordionContent>
        {runningConferences.length > 0 ? (
          <RunningConferencesList
            items={runningConferences}
            className="mb-6 mt-2"
          />
        ) : (
          <div className="mb-6 mt-2 text-center">{t('feed.noConferences')}</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export default RunningConferencesAccordionItem;
