import React from 'react';
import { useTranslation } from 'react-i18next';
import { APPS } from '@libs/appconfig/types';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { AccordionSH } from '@/components/ui/AccordionSH';
import { Card, CardContent } from '@/components/shared/Card';
import ConferencesFeed from '@/pages/Dashboard/Feed/conferences/ConferencesFeed';
import MailsFeed from '@/pages/Dashboard/Feed/mails/MailsFeed';

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
            <AccordionSH
              type="multiple"
              defaultValue={[APPS.MAIL, APPS.CONFERENCES]}
            >
              <ConferencesFeed />
              <MailsFeed />
            </AccordionSH>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default Feed;
