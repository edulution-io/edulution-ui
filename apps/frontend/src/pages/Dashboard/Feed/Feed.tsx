import React from 'react';
import { useTranslation } from 'react-i18next';
import { APPS } from '@libs/appconfig/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { Accordion } from '@/components/ui/Accordion';
import { Card, CardContent } from '@/components/shared/Card';
import RunningConferencesAccordionItem from '@/pages/Dashboard/Feed/conferences/RunningConferencesAccordionItem';

const Feed = () => {
  const { t } = useTranslation();

  return (
    <Card
      variant="collaboration"
      className="min-h-[280px] overflow-y-auto md:min-h-[100%]"
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