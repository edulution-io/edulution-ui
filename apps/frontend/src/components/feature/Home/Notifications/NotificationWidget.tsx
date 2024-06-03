import React, { useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import useNotificationStore from '@/components/feature/Home/Notifications/NotificationWidgetStore';
import ConferencesCardContent from '@/components/feature/Home/Notifications/ConferencesCardContent';
import MailCardContent from '@/components/feature/Home/Notifications/MailCardContent';
import SurveysCardContent from '@/components/feature/Home/Notifications/SurveysCardContent';

const NotificationWidget = () => {

  const { lastUpdated, setLastUpdated, conferences, getConferences, openSurveys, getOpenSurveys, mails, fetchMails } = useNotificationStore();
  const currentTime = new Date().getTime();
  const timeElapsed = lastUpdated ? currentTime - lastUpdated : 0;
  const shouldUpdate = !lastUpdated || timeElapsed > 3000;

  useEffect(() => {
    const fetch = async () => {
      let promises = [];
      if (shouldUpdate || !conferences || conferences.length === 0) {
        promises.push(await getConferences());
      }
      if (shouldUpdate || !openSurveys || openSurveys.length === 0) {
        promises.push(await getOpenSurveys());
      }
      if (shouldUpdate || !mails || mails.length === 0) {
        promises.push(await fetchMails());
      }
      await Promise.all(promises);
      setLastUpdated(currentTime);
    }
    fetch();
  }, [shouldUpdate, conferences, openSurveys, mails]);

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%]"
    >
      <ConferencesCardContent conferences={ conferences } />
      <SurveysCardContent surveys={ openSurveys } />
      <MailCardContent mails={ mails } />
    </Card>
  );
};

export default NotificationWidget;
