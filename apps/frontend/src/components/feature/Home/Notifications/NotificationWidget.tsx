import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import useNotificationStore from '@/components/feature/Home/Notifications/NotificationWidgetStore';
import ConferencesCardContent from '@/components/feature/Home/Notifications/components/ConferencesCardContent';
import MailCardContent from '@/components/feature/Home/Notifications/components/MailCardContent';
import SurveysCardContent from '@/components/feature/Home/Notifications/components/SurveysCardContent';
import { ScrollArea } from '@/components/ui/ScrollArea';

const NotificationWidget = () => {
  const { /* lastUpdated, setLastUpdated, */ conferences, getConferences, openSurveys, getOpenSurveys, mails, fetchMails } =
    useNotificationStore();
  // const currentTime = new Date().getTime();
  // const timeElapsed = lastUpdated ? currentTime - lastUpdated : 0;
  // const shouldUpdate = !lastUpdated || timeElapsed > 3000;

  const { t } = useTranslation();

  useEffect(() => {
    const fetch = async () => {
      await getConferences();
      await getOpenSurveys();
      await fetchMails();
    };
    fetch();
  }, []);

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%] overflow-auto"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('accountData.account_info')}</h4>

          <ScrollArea>
            <ConferencesCardContent conferences={conferences} />
            <SurveysCardContent surveys={openSurveys} />
            <MailCardContent mails={mails} />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationWidget;
