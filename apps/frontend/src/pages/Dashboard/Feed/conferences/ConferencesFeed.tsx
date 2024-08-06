import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConferencesIcon } from '@/assets/icons';
import { APPS } from '@libs/appconfig/types';
import { AccordionContent, AccordionItem } from '@/components/ui/Accordion';
import RunningConferencesList from '@/pages/Dashboard/Feed/conferences/RunningConferencesList';
import FeedWidgetAccordionTrigger from '@/pages/Dashboard/Feed/components/FeedWidgetAccordionTrigger';
import useIsConferenceActive from '@/pages/Dashboard/Feed/conferences/useIsConferenceActive';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';

const ConferencesFeed = () => {
  const { runningConferences } = useConferenceStore();

  const { t } = useTranslation();

  const isActive = useIsConferenceActive();
  if (!isActive) {
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

export default ConferencesFeed;
