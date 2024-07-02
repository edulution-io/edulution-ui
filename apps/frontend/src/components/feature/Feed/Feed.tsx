import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterval } from 'usehooks-ts';
import useIsMobileView from '@/hooks/useIsMobileView';
import cn from '@/lib/utils';
import { AppConfigDto, APPS } from '@libs/appconfig/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Accordion } from '@/components/ui/Accordion';
import { Card, CardContent } from '@/components/shared/Card';
import RunningConferencesAccordionItem from '@/components/feature/Feed/components/RunningConferencesAccordionItem';
import useAppConfigsStore from '@/pages/Settings/AppConfig/appConfigsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';

const FEED_PULL_TIME_INTERVAL = 10000;

const Feed = () => {
  const { appConfigs } = useAppConfigsStore();

  const { getConferences } = useConferenceStore();

  const { t } = useTranslation();

  const isMobileView = useIsMobileView();

  // TODO: NIEDUUI-312: Remove this check when the information about the app is stored in the appConfigs/userConfig/dataBase
  const isConferenceAppActivated = useMemo(
    () => !!appConfigs.find((conf: AppConfigDto) => conf.name === APPS.CONFERENCES.toString()),
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
              {isConferenceAppActivated ? <RunningConferencesAccordionItem /> : null}
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
