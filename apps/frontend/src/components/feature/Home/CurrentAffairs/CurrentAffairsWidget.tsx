import React, { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/shared/Card';
import { ScrollArea } from '@/components/ui/ScrollArea';
import useCurrentAffairsStore from '@/components/feature/Home/CurrentAffairs/CurrentAffairsStore';
import useConferenceStore from '@/pages/ConferencePage/ConferencesStore';
import useSurveyTablesPageStore from '@/pages/Surveys/Tables/SurveysTablesPageStore';
import useMailStore from '@/components/feature/Home/Notification/MailStore';
import ConferencesCardContent from '@/components/feature/Home/CurrentAffairs/components/ConferencesCardContent';
import MailCardContent from '@/components/feature/Home/CurrentAffairs/components/MailCardContent';
import SurveysCardContent from '@/components/feature/Home/CurrentAffairs/components/SurveysCardContent';
import Conference from '@/pages/ConferencePage/dto/conference.dto';

const CurrentAffairsWidget = () => {

  const { t } = useTranslation();

  const { shouldUpdate, checkIsUpdateNeeded, startUpdating, finishUpdating } = useCurrentAffairsStore();
  const { conferences, getConferences } = useConferenceStore();
  const { openSurveys, updateOpenSurveys } = useSurveyTablesPageStore();
  const { mails, fetchMails } = useMailStore();

  checkIsUpdateNeeded();

  useEffect(() => {
    const fetch = async () => {
      startUpdating();
      await getConferences();
      await updateOpenSurveys();
      await fetchMails();
      finishUpdating();
    };
    if (shouldUpdate) {
      fetch;
    }
    fetch();
  }, [shouldUpdate]);

  const filteredConferences = useMemo(() => {
    return conferences.filter((conference: Conference) => conference.isRunning)
  }, [conferences]);

  return (
    <Card
      variant="collaboration"
      className="min-h-[100%] overflow-auto"
      style={{ height: '10px', maxHeight: 'initial', width: '100%' }}
    >
      <CardContent>
        <div className="flex flex-col gap-3">
          <h4 className="font-bold">{t('important')}</h4>

          <ScrollArea>
            <ConferencesCardContent conferences={filteredConferences} />
            <SurveysCardContent surveys={openSurveys} />
            <MailCardContent mails={mails} />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentAffairsWidget;
