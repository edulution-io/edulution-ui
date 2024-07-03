import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import { ConferencesIcon } from '@/assets/icons';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import WidgetLabelWithImageForTriggers from '@/components/feature/components/widgetLabelWithImageForTriggers';
import FEED_PULL_TIME_INTERVAL from '@/components/feature/components/constants/pull-time-interval';
import RunningConferencesList from '@/components/feature/Feed/conferences/RunningConferencesList';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';

const RunningConferencesAccordionItem = () => {
  const { appConfigs, getAppConfigs } = useAppConfigsStore();

  useEffect(() => {
    void getAppConfigs();
  }, []);

  // TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
  const isConferenceAppActivated = useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.CONFERENCES.toString()),
    [appConfigs],
  );

  if (!isConferenceAppActivated) {
    return null;
  }

  const { conferences, getConferences } = useConferenceStore();

  const { t } = useTranslation();

  useInterval(() => {
    void getConferences();
  }, FEED_PULL_TIME_INTERVAL);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences();
    }
  }, []);

  // TODO: NIEDUUI-287: Instead of filtering the conferences in the frontend we should create a new endpoint that only returns the running conferences
  const filteredConferences = useMemo(
    () => conferences.filter((conference: Conference) => conference.isRunning),
    [conferences],
  );

  return (
    <AccordionItem value={APPS.CONFERENCES}>
      <AccordionTrigger className="flex text-xl font-bold">
        <WidgetLabelWithImageForTriggers
          src={ConferencesIcon}
          alt={`${APPS.CONFERENCES}-notification-icon`}
          translationIdLabel="conferences.sidebar"
        />
      </AccordionTrigger>
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
