import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ConferencesIcon } from '@/assets/icons';
import { APPS } from '@/datatypes/types';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import RunningConferencesList from '@/components/feature/Feed/components/RunningConferencesList';
import Conference from '@/pages/ConferencePage/dto/conference.dto';

interface RunningConferencesAccordionItemProps {
  conferences: Conference[];
}

const RunningConferencesAccordionItem = (props: RunningConferencesAccordionItemProps) => {
  const { conferences } = props;

  const { t } = useTranslation();

  // TODO: NIEDUUI-287: Instead of filtering the conferences in the frontend we should create a new endpoint that only returns the running conferences
  const filteredConferences = useMemo(
    () => conferences.filter((conference: Conference) => conference.isRunning),
    [conferences],
  );

  return (
    <AccordionItem value={APPS.CONFERENCES}>
      <AccordionTrigger className="flex text-xl font-bold">
        <img
          src={ConferencesIcon}
          alt={`${APPS.CONFERENCES}-notification-icon`}
          width={BUTTONS_ICON_WIDTH}
          className="mr-4"
        />
        {t('conferences.sidebar')}
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
