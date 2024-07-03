import React from 'react';
import { useTranslation } from 'react-i18next';
import useIsMobileView from '@/hooks/useIsMobileView';
import cn from '@/lib/utils';
import { APPS } from '@libs/appconfig/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Accordion } from '@/components/ui/Accordion';
import { Card, CardContent } from '@/components/shared/Card';
import RunningConferencesAccordionItem from '@/components/feature/Feed/conferences/RunningConferencesAccordionItem';

const Feed = () => {
  const { t } = useTranslation();

  const isMobileView = useIsMobileView();

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
              <RunningConferencesAccordionItem />
            </Accordion>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
