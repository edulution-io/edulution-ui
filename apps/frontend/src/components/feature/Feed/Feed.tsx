import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import useIsMobileView from '@/hooks/useIsMobileView';
import { ConferencesIcon } from '@/assets/icons';
import { APPS } from '@/datatypes/types';
import cn from '@/lib/utils';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AccordionContent, AccordionItem, Accordion, AccordionTrigger } from '@/components/ui/Accordion';
import { Card, CardContent } from '@/components/shared/Card';
import ConferencesList from '@/components/feature/Feed/components/ConferencesList';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import Conference from '@/pages/ConferencePage/dto/conference.dto';

const FEED_PULL_TIME_INTERVAL = 10000;

const Feed = () => {
  const { conferences, getConferences } = useConferenceStore();

  const { t } = useTranslation();

  const isMobileView = useIsMobileView();

  // Interval fetch every 10s
  useInterval(() => {
    void getConferences();
  }, FEED_PULL_TIME_INTERVAL);

  useEffect(() => {
    void getConferences();
  }, []);

  // TODO: NIEDUUI-287: Instead of filtering the conferences in the frontend we should create a new endpoint that only returns the running conferences
  const filteredConferences = conferences.filter((conference: Conference) => conference.isRunning);

  return (
    <Card
      variant="collaboration"
      className={ cn(
          {'min-h-[280px]': isMobileView},
          {'min-h-[100%]': !isMobileView},
          'overflow-y-auto'
        )
      }
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('feed.title')}</h4>
          <ScrollArea>
            <Accordion
              type="multiple"
              defaultValue={[APPS.CONFERENCES]}
            >
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
                    <ConferencesList
                      items={filteredConferences}
                      className="mb-6 mt-2"
                    />
                  ) : (
                    <div className="mb-6 mt-2 text-center">{t('feed.noConferences')}</div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
