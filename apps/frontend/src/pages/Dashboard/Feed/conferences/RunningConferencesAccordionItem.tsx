import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import { ConferencesIcon } from '@/assets/icons';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import Conference from '@libs/conferences/types/conference.dto';
import FEED_PULL_TIME_INTERVAL from '@libs/dashboard/constants/pull-time-interval';
import { AccordionContent, AccordionItem } from '@/components/ui/Accordion';
import RunningConferencesList from '@/pages/Dashboard/Feed/conferences/RunningConferencesList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';

const RunningConferencesAccordionItem = () => {
  const { appConfigs } = useAppConfigsStore();

  const { conferences, getConferences } = useConferenceStore();

  const { t } = useTranslation();

  useInterval(() => {
    void getConferences();
  }, FEED_PULL_TIME_INTERVAL);

  useEffect(() => {
    void getConferences();
  }, []);

  // TODO: NIEDUUI-287: Instead of filtering the conferences in the frontend we should create a new endpoint that only returns the running conferences
  const filteredConferences = useMemo(
    () => conferences.filter((conference: Conference) => conference.isRunning),
    [conferences],
  );

  // TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
  const isConferenceAppActivated = useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.CONFERENCES.toString()),
    [appConfigs],
  );

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
        {filteredConferences.length > 0 ? (
          <RunningConferencesList
            items={filteredConferences}
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
