import React from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import { ConferencesIcon } from '@/assets/icons';
import { BUTTONS_ICON_WIDTH } from '@/constants/style';
import { Card, CardContent } from '@/components/shared/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import Conference from '@/pages/ConferencePage/dto/conference.dto';
import ConferencesList from '@/components/feature/Feed/components/ConferencesList';

const FEED_PULL_TIME_INTERVAL = 10000;

const Feed = () => {
  const { conferences, getConferences } = useConferenceStore();

  const { t } = useTranslation();

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  useInterval(async () => {
    await getConferences();
  }, FEED_PULL_TIME_INTERVAL);

  // TODO: NIEDUUI-287: Instead of filtering the conferences in the frontend we should create a new endpoint that only returns the running conferences
  const filteredConferences = conferences.filter((conference: Conference) => conference.isRunning);

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%] overflow-auto"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('feed.title')}</h4>
          <ScrollArea>
            <AccordionSH type="multiple">
              <AccordionItem value="item-1">
                <AccordionTrigger className="flex text-xl font-bold">
                  <img
                    src={ConferencesIcon}
                    alt="conference-notification-icon"
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
            </AccordionSH>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
