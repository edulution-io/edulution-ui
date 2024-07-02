import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import useIsMobileView from '@/hooks/useIsMobileView';
import cn from '@/lib/utils';
import { AppConfig, APPS } from '@/datatypes/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Accordion } from '@/components/ui/Accordion';
import { Card, CardContent } from '@/components/shared/Card';
import RunningConferencesAccordionItem from '@/components/feature/Feed/components/RunningConferencesAccordionItem';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useAppConfigsStore from '@/store/appConfigsStore';

const FEED_PULL_TIME_INTERVAL = 10000;

const Feed = () => {
  const { appConfigs = [], getAppConfigs } = useAppConfigsStore();

  const { conferences = [], getConferences } = useConferenceStore();

  const { t } = useTranslation();

  const isMobileView = useIsMobileView();

  useEffect(() => {
    void getAppConfigs();
  }, []);

  const isConferenceAppActivated = useMemo(
    () => !!appConfigs.find((conf: AppConfig) => conf.name === APPS.CONFERENCES.toString()),
    [appConfigs],
  );

  // Interval fetch every 10s
  useInterval(() => {
    if (isConferenceAppActivated) {
      void getConferences();
    }
  }, FEED_PULL_TIME_INTERVAL);

  useEffect(() => {
    if (isConferenceAppActivated) {
      void getConferences();
    }
  }, []);

  return (
    <Card
      variant="collaboration"
      className={cn({ 'min-h-[280px]': isMobileView }, { 'min-h-[100%]': !isMobileView }, 'overflow-y-auto')}
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
              {isConferenceAppActivated ? <RunningConferencesAccordionItem conferences={conferences} /> : null}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
